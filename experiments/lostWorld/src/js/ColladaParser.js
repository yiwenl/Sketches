// ColladaParser.js

let ColladaParser = {};

import alfrid, { GL } from 'alfrid';

function findMesh(id, meshes) {
	for(let s in meshes) {
		if( s === id) {
			return meshes[s];
		}
	}
}

function formBuffer(mData, mNum) {
	const ary = [];

	for(let i=0; i<mData.length; i+= mNum) {
		let o = [];
		for(let j=0; j<mNum; j++) {
			o.push(mData[i+j]);
		}

		ary.push(o);
	}

	return ary;
}

function getMesh(id, meshes) {
	return meshes.find((m)=> {
		return m.id === id;
	}).mesh;
}


function getMaterial(id, materials) {
	let mat;
	for(let s in materials ) {
		if(s === id) {
			mat = materials[s];
		}
	}


	let oMaterial = {};
	if(mat.diffuse) {
		oMaterial.diffuseColor = mat.diffuse;
	}

	oMaterial.diffuseColor = mat.diffuse || [0, 0, 0];
	oMaterial.shininess = mat.shininess || 0;
	if(mat.textures) {
		if(mat.textures.diffuse) {
			oMaterial.diffuseMapID = mat.textures.diffuse.map_id;
		}

		if(mat.textures.normal) {
			oMaterial.normalMapID = mat.textures.normal.map_id;
		}
	}

	return oMaterial;
}


ColladaParser.parse = function(oData, mDefault) {
	if(!mDefault) {
		mDefault = mat4.create();
	}

	const o = Collada.parse(oData);
	const { materials, meshes } = o;

	const finalMeshes = [];
	const meshObjs = [];

	const meshCaches = [];

	//	generate meshes
	for(let s in meshes) {
		const oMesh = meshes[s];
		const { vertices, normals, coords, triangles } = oMesh;
		const _vertices = formBuffer(vertices, 3);
		const _normals = formBuffer(normals, 3);
		const _coords = formBuffer(coords, 2);

		const mesh = new alfrid.Mesh();
		mesh.bufferVertex(_vertices);
		mesh.bufferTexCoord(_coords);
		mesh.bufferNormal(_normals);
		mesh.bufferIndex(triangles);

		meshCaches.push({
			id:s,
			mesh,
		});
	}


	//	generate materials data

	function walk(node, mtxParent) {
		let m = mat4.create();
		if(node.model) {
			mat4.multiply(m, mtxParent, node.model);
		} else {
			mat4.copy(m, mtxParent);
		}

		if(node.children.length > 0) {
			node.children.forEach((child)=> {
				walk(child, m);
			});
		}

		if(node.mesh) {
			const meshObj = findMesh(node.mesh, meshes);
			mat4.multiply(m, mDefault, m);

			const oMesh       = {};
			oMesh.modelMatrix = m;
			oMesh.mesh        = getMesh(node.mesh, meshCaches);
			oMesh.id          = node.id;
			oMesh.name        = node.name;
			oMesh.material    = getMaterial(node.material, materials);
			meshObjs.push(oMesh);
		}
	}

	let mtx = mat4.create();
	walk(o.root, mtx);

	return meshObjs;
}


export default ColladaParser;