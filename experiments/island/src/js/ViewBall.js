// ViewBall.js

import alfrid, { GL } from 'alfrid';
import Assets from './Assets';
import vs from '../shaders/ball.vert';
import fs from '../shaders/ball.frag';

class ViewBall extends alfrid.View {
	
	constructor() {
		super(null, fs);

		this.shaderOutline = new alfrid.GLShader(vs, alfrid.ShaderLibs.simpleColorFrag);
	}


	_init() {
		this.mesh = alfrid.Geom.sphere(params.sphereSize, 24 * 1.5);
		this.texture = Assets.get('paper-ball');
	}


	render() {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		this.texture.bind(0);
		this.shader.uniform(params.light);
		GL.draw(this.mesh);

		this.shaderOutline.bind();
		this.shaderOutline.uniform("uLineWidth", "float", 1.025);
		this.shaderOutline.uniform("color", "vec3", [1, 1, 1]);
		this.shaderOutline.uniform("opacity", "float", 1.0);
		GL.gl.cullFace(GL.gl.FRONT);
		GL.draw(this.mesh);
		GL.gl.cullFace(GL.gl.BACK);

	}


}

export default ViewBall;