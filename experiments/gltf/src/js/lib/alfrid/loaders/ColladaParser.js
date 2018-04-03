// ColladaParser.js

import parser from 'collada-parser';
import Geometry from '../Geometry';


const generateGeometry = function (meshes) {
	const caches = {};

	meshes.forEach((mesh)=> {
		const { vertices, normals, coords, triangles, name } = mesh.mesh;
		if(!caches[name]) {
			const glGeometry = new Geometry()
				.bufferFlattenData(vertices, 'aVertexPosition', 3)
				.bufferFlattenData(coords, 'aTextureCoord', 2)
				.bufferFlattenData(normals, 'aNormal', 3)
				.bufferIndex(triangles);

			caches[name] = glGeometry;
		}

		mesh.glGeometry = caches[name];
	});
};

const parse = function (mData) {
	const meshes = parser.parse(mData);
	generateGeometry(meshes);

	return meshes;
};

const load = function (mPath, mCallback) {
	parser.load(mPath, (meshes)=> {
		generateGeometry(meshes);
		mCallback(meshes);
	});
};

const ColladaParser = {
	parse,
	load
};


export default ColladaParser;