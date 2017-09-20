// createRingMesh.js

import alfrid, { Mesh } from 'alfrid';

const num = 20;
var random = function(min, max) { return min + Math.random() * (max - min);	}

const getPos = (i, y, height, radius, theta) => {
	let _x, _y, _z;

	let angle = -theta/2 + i/num * theta + Math.PI/2;
	_y = y + height;

	_x = Math.cos(angle) * radius;
	_z = Math.sin(angle) * radius;

	return [_x, _y, _z];
}

const createRingMesh = (y, height, radius, theta) => {
	const positions = [];
	const normals = [];
	const uvs = [];
	const indices = [];
	const extras = [];
	let count = 0;

	const rotation = Math.random() * Math.PI * 2;
	const speed = random(.2, .6);

	for(let i=0; i<num; i++) {
		positions.push(getPos(i, y, -height, radius, theta));
		positions.push(getPos(i+1, y, -height, radius, theta));
		positions.push(getPos(i+1, y,  height, radius, theta));
		positions.push(getPos(i, y,  height, radius, theta));


		//*/
		uvs.push([i/num, 0]);
		uvs.push([(i+1)/num, 0]);
		uvs.push([(i+1)/num, 1]);
		uvs.push([i/num, 1]);
		/*/
		uvs.push([0, 0]);
		uvs.push([1, 0]);
		uvs.push([1, 1]);
		uvs.push([0, 1]);
		//*/

		normals.push([0, 0, -1]);
		normals.push([0, 0, -1]);
		normals.push([0, 0, -1]);
		normals.push([0, 0, -1]);

		indices.push(count * 4 + 0);
		indices.push(count * 4 + 1);
		indices.push(count * 4 + 2);
		indices.push(count * 4 + 0);
		indices.push(count * 4 + 2);
		indices.push(count * 4 + 3);
		
		extras.push([rotation, speed]);
		extras.push([rotation, speed]);
		extras.push([rotation, speed]);
		extras.push([rotation, speed]);

		count ++;
	}


	const mesh = new Mesh();
	mesh.bufferVertex(positions);
	mesh.bufferTexCoord(uvs);
	mesh.bufferNormal(normals);
	mesh.bufferIndex(indices);
	mesh.bufferData(extras, 'aExtra');

	return mesh;
}


export default createRingMesh;