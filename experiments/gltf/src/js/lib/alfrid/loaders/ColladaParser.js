// ColladaParser.js

import parser from 'collada-parser';
import Mesh from '../Mesh';


const generateMesh = function (meshes) {
	const caches = {};

	meshes.forEach((mesh)=> {
		const { vertices, normals, coords, triangles, name } = mesh.mesh;
		if(!caches[name]) {
			const glMesh = new Mesh()
				.bufferFlattenData(vertices, 'aVertexPosition', 3)
				.bufferFlattenData(coords, 'aTextureCoord', 2)
				.bufferFlattenData(normals, 'aNormal', 3)
				.bufferIndex(triangles);

			caches[name] = glMesh;
		}

		mesh.glMesh = caches[name];
	});
};

const parse = function (mData) {
	const meshes = parser.parse(mData);
	generateMesh(meshes);

	return meshes;
};

const load = function (mPath, mCallback) {
	parser.load(mPath, (meshes)=> {
		generateMesh(meshes);
		mCallback(meshes);
	});
};

const ColladaParser = {
	parse,
	load
};


export default ColladaParser;