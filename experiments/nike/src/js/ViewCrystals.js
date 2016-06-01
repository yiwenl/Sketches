// ViewCrystals.js

import alfrid, { GL } from 'alfrid';

let vs = require('../shaders/crystal.vert');
const fs = require('../shaders/pbr.frag');
const random = function(min, max) { return min + Math.random() * (max - min);	}

class ViewCrystals extends alfrid.View {
	
	constructor(mIndex, mTotal, mMesh, mMeshCrystal) {

		vs = vs.replace('${NUM}', Math.floor(params.numTouches));
		super(vs, fs);

		this._meshNike = mMesh;
		this._meshCrystal = mMeshCrystal;
		this._index = mIndex;
		this._total = mTotal;
		this._scale = 1;
		const range = 5;
		this._position = [0, -1, 0];
		this._rotation = [0, 0, 0];
		this._initMesh();
	}


	_initMesh() {
		const meshCrystal = this._meshCrystal;
		const _vertices = meshCrystal.vertices;
		const _normals = meshCrystal.normals;
		const _coords = meshCrystal._texCoords;
		const _indices = meshCrystal._indices;

		const positions = [];
		const posOffset = [];
		const normals = [];
		const coords = [];
		const indices = [];
		let count = 0;
		const indexCount = 72;

		const _verticesNike = this._meshNike.vertices;
		const _normalsNike = this._meshNike.normals;

		let va = vec3.create();
		let vb = vec3.create();
		function getRotation(a, b) {
			vec3.copy(va, a);
			vec3.copy(vb, b);
			let axis = vec3.create();

			vec3.cross(axis, a, b);
			let angle = vec3.dot(a, b) + Math.PI/2;

			return {
				axis, 
				angle,
			}
		}

		let m = mat4.create();

		function rotate(axis, angle, v) {
			mat4.identity(m);
			mat4.fromRotation(m, angle, axis);
			vec3.transformMat4(v, v, m);
			return v;
		}

		const totalIncre = Math.floor(_verticesNike.length/this._total);
		const sMin = .1;
		const sMax = .2;
		let tmp = 0;
		for (let i=0; i<totalIncre; i++) {
			const pivot = i + this._index * totalIncre;
			const vertexNike = _verticesNike[pivot];
			const normalNike = _normalsNike[pivot];
			const scaleXZ = random(sMin, sMax);
			const scaleY = random(sMin, sMax) * 3.0;

			if(Math.random() > .25) {
				continue;
			}

			tmp ++;
			for (let j=0; j<_vertices.length; j++) {
				// positions.push(_vertices[j]);
				let v = vec3.clone(_vertices[j]);
				
				v[0] *= scaleXZ;
				v[1] *= scaleY;
				v[2] *= scaleXZ;
				let n = vec3.clone(_normals[j]);
				let uv = _coords[j];
				let rotation = getRotation(normalNike, [0, 1, 0]);

				v = rotate(rotation.axis, rotation.angle, v);
				n = rotate(rotation.axis, rotation.angle, n);

				positions.push(v);
				normals.push(n);
				posOffset.push(vertexNike);
				coords.push(uv);

				indices.push(count * indexCount + _indices[j]);
			}

			count ++;
		}

		this.mesh = new alfrid.Mesh();
		this.mesh.bufferVertex(positions);
		this.mesh.bufferTexCoord(coords);
		this.mesh.bufferNormal(normals);
		this.mesh.bufferIndex(indices);
		this.mesh.bufferData(posOffset, 'aPosOffset', 3);

		this.roughness = .8;
		this.specular = 1.0;
		this.metallic = 0.74;
		this.baseColor = [0, 0, 0];
	}


	render(textureRad, textureIrr, textureAO, mShader, mTouches, mTouchForces) {
		// const forces = mTouchForces.map((f)=>(f.value));
		let touches = [];
		for(let i=0; i<mTouches.length; i++) {
			// touches = touches.concat(mTouches[i]);
			touches.push(mTouches[i][0]);
			touches.push(mTouches[i][1]);
			touches.push(mTouches[i][2]);
			touches.push(mTouchForces[i].value);
		}

		if(Math.random() > .99) {
			// console.log(touches);
		}
		this.roughness = params.roughness;
		this.specular = params.specular;
		this.metallic = params.metallic;
		this.baseColor = [params.color[0]/255, params.color[1]/255, params.color[2]/255];
		if(!this.mesh) {
			return;
		}

		let shader = this.shader;
		if(mShader) {
			shader = mShader;
		}
		shader.bind();

		shader.uniform('uAoMap', 'uniform1i', 0);
		shader.uniform('uRadianceMap', 'uniform1i', 1);
		shader.uniform('uIrradianceMap', 'uniform1i', 2);
		textureAO.bind(0);
		textureRad.bind(1);
		textureIrr.bind(2);

		shader.uniform('uBaseColor', 'uniform3fv', this.baseColor);
		shader.uniform('uRoughness', 'uniform1f', this.roughness);
		shader.uniform('uMetallic', 'uniform1f', this.metallic);
		shader.uniform('uSpecular', 'uniform1f', this.specular);

		shader.uniform('uScale', 'vec3', [this._scale, this._scale, this._scale]);
		shader.uniform('uPosition', 'vec3', this._position);
		shader.uniform('uRotation', 'vec3', this._rotation);
		shader.uniform('uGlobalTime', 'float', params.time);

		shader.uniform('uExposure', 'uniform1f', params.exposure);
		shader.uniform('uGamma', 'uniform1f', params.gamma);

		shader.uniform('uTouches', 'vec4', touches);

		GL.draw(this.mesh);
	}


}

export default ViewCrystals;