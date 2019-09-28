// GLTFParser.js

import alfrid, { Mesh } from 'alfrid';

const ARRAY_CTOR_MAP = {
	5120: Int8Array,
	5121: Uint8Array,
	5122: Int16Array,
	5123: Uint16Array,
	5125: Uint32Array,
	5126: Float32Array
};

const SIZE_MAP = {
	SCALAR: 1,
	VEC2: 2,
	VEC3: 3,
	VEC4: 4,
	MAT2: 4,
	MAT3: 9,
	MAT4: 16
};

const semanticAttributeMap = {
	NORMAL: 'aNormal',
	POSITION: 'aVertexPosition',
	// 'TANGENT': 'aTangent',
	TEXCOORD_0: 'aTextureCoord',
	// TEXCOORD_1: 'aTextureCoord1',
	WEIGHTS_0: 'aWeight',
	JOINTS_0: 'aJoint',
	COLOR: 'aColor'
};


const parse = (gltf, bin) => new Promise((resolve, reject) => {

	gltf.output = {
		meshes:[],
		scenes:[],
		textures:[]
	};

	_getBufferViewData(gltf, bin)
	.then(_parseMesh)
	.then((gltfInfo)=>{
		resolve(gltfInfo);
	})
	.catch(e => {
		console.log('Error:', e);
	});
	// resolve(o);
});




const _getBufferViewData = (gltfInfo, bin) => new Promise((resolve, reject) => {
	const { bufferViews, buffers } = gltfInfo;

	bufferViews.forEach((bufferViewInfo, i) => {
		const buffer = bin;
		bufferViewInfo.data = buffer.slice(bufferViewInfo.byteOffset || 0, (bufferViewInfo.byteOffset || 0) + (bufferViewInfo.byteLength || 0));
	});
	resolve(gltfInfo);
});

const _parseMesh = (gltf) => new Promise((resolve, reject) => {
	const { meshes } = gltf;
	gltf.geometries = [];
	

	meshes.forEach((mesh, i) => {
		const { primitives } = mesh;

		const geometry = {};

		primitives.forEach((primitiveInfo, i) => {
			const semantics = Object.keys(primitiveInfo.attributes);
			let defines = {};

			semantics.forEach((semantic, i) => {
				const accessorIdx = primitiveInfo.attributes[semantic];
				const attributeInfo = gltf.accessors[accessorIdx];
				const attributeName = semanticAttributeMap[semantic];
				if(!attributeName) {
					return;
				}
				if(semantic === 'NORMAL') {
					defines.HAS_NORMALS = 1;
				} 
				if(semantic.indexOf('TEXCOORD') > -1) {
					defines.HAS_UV = 1;
				}


				const size = SIZE_MAP[attributeInfo.type];
				let attributeArray = _getAccessorData(gltf, accessorIdx);
				if (attributeArray instanceof Uint32Array) {
					attributeArray = new Float32Array(attributeArray);
				}

				if(semantic === 'TEXCOORD_1') {
					console.log(size, attributeArray);
				}

				geometry[attributeName] = {
					value:attributeArray,
					size,
				};
				// console.log('attribute', attributeName, geometry[attributeName]);
			});

			//	parse index
			if (primitiveInfo.indices != null) {
				const attributeArray = _getAccessorData(gltf, primitiveInfo.indices, true);
				geometry.indices = {
					value:attributeArray,
					size:1
				};
			}

			const m = new Mesh();

			for(const s in geometry) {
				const data = geometry[s];
				if(s !== 'indices') {
					m.bufferFlattenData(data.value, s, data.size);
				} else {
					m.bufferIndex(data.value);
				}
			}

			gltf.output.meshes.push(m);
			if (primitiveInfo.material && 0) {
				console.log('gltf.output', gltf.output, primitiveInfo.material);
				const material = gltf.output.materials[primitiveInfo.material];
				m.material = material;
				defines = objectAssign(defines, m.material.defines);

				m.defines = defines;

				const shader = Shaders.get(ShaderLibs.gltfVert, ShaderLibs.gltfFrag, defines);

				const {
					emissiveFacotr,
					normalTexture,
					occlusionTexture,
					pbrMetallicRoughness,
				} = material;

				const {
					baseColorTexture,
					metallicRoughnessTexture
				} = pbrMetallicRoughness;

				const uniforms = {
					uEmissiveFactor:emissiveFacotr || [0, 0, 0],
					uBaseColor:pbrMetallicRoughness.baseColorFactor || [1, 1, 1, 1],
					uRoughness:pbrMetallicRoughness.roughnessFactor || 1,
					uMetallic:pbrMetallicRoughness.metallicFactor || 1,
					uScaleDiffBaseMR:[0, 0, 0, 0],
					uScaleFGDSpec:[0, 0, 0, 0],
					uScaleIBLAmbient:[1, 1, 1, 1],
					uLightDirection:[1, 1, 1],
					uLightColor:[1, 1, 1],
					uGamma:1
				};

				if (baseColorTexture) {
					uniforms.uColorMap = baseColorTexture.glTexture;
				}

				if (metallicRoughnessTexture) {
					uniforms.uMetallicRoughnessMap = metallicRoughnessTexture.glTexture;	
				}

				if (normalTexture) {
					uniforms.uNormalScale = normalTexture.scale || 1;
					uniforms.uNormalMap = normalTexture.glTexture;
				}

				if (occlusionTexture) {
					uniforms.uAoMap = occlusionTexture.glTexture;
					uniforms.uOcclusionStrength = occlusionTexture.strength || 1;
				}

				shader.bind();
				shader.uniform(uniforms);


				m.material.shader = shader;
				m.material.uniforms = uniforms;
			}
			
			gltf.geometries.push(geometry);
		});
	});

	resolve(gltf);
});

const _getAccessorData = (gltf, accessorIdx, isIndices = false) => {
	const accessorInfo = gltf.accessors[accessorIdx];
	const buffer = gltf.bufferViews[accessorInfo.bufferView].data;
	const byteOffset = accessorInfo.byteOffset || 0;
	const ArrayCtor = ARRAY_CTOR_MAP[accessorInfo.componentType] || Float32Array;
	let size = SIZE_MAP[accessorInfo.type];
	if (size == null && isIndices) {
		size = 1;
	}
	let arr = new ArrayCtor(buffer, byteOffset, size * accessorInfo.count);
	const quantizeExtension = accessorInfo.extensions && accessorInfo.extensions['WEB3D_quantized_attributes'];
	if (quantizeExtension) {
		const decodedArr = new Float32Array(size * accessorInfo.count);
		const decodeMatrix = quantizeExtension.decodeMatrix;
		const decodeOffset = new Array(size);
		const decodeScale = new Array(size);
		for (let k = 0; k < size; k++) {
			decodeOffset[k] = decodeMatrix[size * (size + 1) + k];
			decodeScale[k] = decodeMatrix[k * (size + 1) + k];
		}
		for (let i = 0; i < accessorInfo.count; i++) {
			for (let k = 0; k < size; k++) {
				decodedArr[i * size + k] = arr[i * size + k] * decodeScale[k] + decodeOffset[k];
			}
		}

		arr = decodedArr;
	}

	// console.log({buffer, byteOffset, ArrayCtor, size, arr});

	return arr;
};

export {
	parse
}