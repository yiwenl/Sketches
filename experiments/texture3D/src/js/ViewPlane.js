// ViewPlane.js

import alfrid, { GL } from 'alfrid';
import vs from 'shaders/plane.vert';
import fs from 'shaders/plane.frag';

class ViewPlane extends alfrid.View {
	
	constructor() {
		super(vs, fs);

		this.matrix = mat4.create();
		mat4.translate(this.matrix, this.matrix, vec3.fromValues(1, 0, 0));
	}


	_init() {
		this.mesh = alfrid.Geom.plane(1, 1, 1);
		this.alpha = 1;

		gui.add(this, 'alpha', 0, 5);
	}


	render(fbos, z, numSlices) {
		const indices = fbos.map((fbo, i)=> i);
		GL.pushMatrix();
		GL.rotate(this.matrix);
		this.shader.bind();

		this.shader.uniform("uZ", "float", z);
		this.shader.uniform("uAlpha", "float", this.alpha);
		this.shader.uniform("uNumSlices", "float", numSlices);
		this.shader.uniform("textures", "uniform1iv", indices);
		fbos.forEach( (fbo, i) => {
			fbo.getTexture().bind(i);
		});


		GL.draw(this.mesh);

		GL.gl.cullFace(GL.gl.FRONT);
		GL.draw(this.mesh);
		GL.gl.cullFace(GL.gl.BACK);

		GL.popMatrix();
	}


}

export default ViewPlane;