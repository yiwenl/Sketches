// ViewBall.js

import alfrid, { GL } from 'alfrid';
import vs from 'shaders/ball.vert';
import fs from 'shaders/ball.frag';

class ViewBall extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		this.mesh = alfrid.Geom.sphere(1, 24, true);
	}


	render(hit, textureFront, textureBack, shadowMartrix0, shadowMartrix1) {
		this.shader.bind();
		this.shader.uniform("uHit", "vec3", hit);
		this.shader.uniform("uLightPos", "vec3", params.lightPos);
		this.shader.uniform("uScale", "float", params.hitRadius);

		this.shader.uniform("textureFront", "uniform1i", 0);
		textureFront.bind(0);
		this.shader.uniform("textureBack", "uniform1i", 1);
		textureBack.bind(1);

		this.shader.uniform("uShadowMatrix0", "mat4", shadowMartrix0);
		this.shader.uniform("uShadowMatrix1", "mat4", shadowMartrix1);

		GL.draw(this.mesh);
	}


}

export default ViewBall;