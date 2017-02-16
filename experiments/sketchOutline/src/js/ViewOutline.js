// ViewOutline.js

import alfrid, { GL } from 'alfrid';
import Assets from './Assets';

import vs from 'shaders/outline.vert';
import fs from 'shaders/outline.frag';

class ViewOutline extends alfrid.View {
	
	constructor() {
		super(vs, fs);
		this.time = 0;
	}


	_init() {
		const meshGiant = Assets.get('kuafu');
		this.mesh = [];

		meshGiant.forEach((m)=>  {
			const { vertices, coords, normals, indices } = m;
			const mesh = new alfrid.Mesh();
			mesh.bufferVertex(vertices);
			mesh.bufferTexCoord(coords);
			mesh.bufferNormal(normals);
			mesh.bufferIndex(indices);

			this.mesh.push(mesh);
		});


		console.log(this.mesh.length);
	}


	render() {
		this.time += 0.001;

		this.shader.bind();
		this.shader.uniform("uTime", "float", this.time);
		this.shader.uniform("uOutlineWidth", "float", params.outlineWidth);
		this.shader.uniform("uOutlineNoise", "float", params.outlineNoise);
		this.shader.uniform("uOutlineNoiseStrength", "float", params.outlineNoiseStrength);

		GL.gl.cullFace(GL.gl.FRONT);
		GL.draw(this.mesh);
		GL.gl.cullFace(GL.gl.BACK);
	}


}

export default ViewOutline;