// ViewHitPlane.js

import alfrid, { GL } from 'alfrid';

import vs from 'shaders/hit.vert';

class ViewHitPlane extends alfrid.View {
	
	constructor() {
		super(vs);
	}


	_init() {

		const positions = [];
		const uv = [];
		const indices = [0, 1, 2, 0, 2, 3];
		const size = params.maxRadius * 2.5;

		// positions.push([0, -size,  size]);
		// positions.push([0, -size, -size]);
		// positions.push([0,  size, -size]);
		// positions.push([0,  size,  size]);

		positions.push([-size, -size, 0]);
		positions.push([ size, -size, 0]);
		positions.push([ size,  size, 0]);
		positions.push([-size,  size, 0]);

		uv.push([0, 0]);
		uv.push([1, 0]);
		uv.push([1, 1]);
		uv.push([0, 1]);

		this.mesh = new alfrid.Mesh();
		this.mesh.bufferVertex(positions);
		this.mesh.bufferTexCoord(uv);
		this.mesh.bufferIndex(indices);
	}


	render() {
		this.shader.bind();
		GL.draw(this.mesh);
	}


}

export default ViewHitPlane;