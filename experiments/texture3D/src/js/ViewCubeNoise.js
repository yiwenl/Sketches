// ViewCubeNoise.js

import alfrid, { GL } from 'alfrid';
import vs from 'shaders/cube.vert';
import fs from 'shaders/cube.frag';
import Config from './Config';

class ViewCubeNoise extends alfrid.View {
	
	constructor() {
		super(vs, fs);

		this.matrix = mat4.create();
		mat4.translate(this.matrix, this.matrix, vec3.fromValues(-1, 0, 0));
	}


	_init() {
		this.mesh = alfrid.Geom.cube(1, 1, 1);
	}


	render() {
		GL.pushMatrix();
		GL.rotate(this.matrix);
		this.shader.bind();
		this.shader.uniform("uNoiseScale", "float", Config.noiseScale);
		GL.draw(this.mesh);
		GL.popMatrix();
	}


}

export default ViewCubeNoise;