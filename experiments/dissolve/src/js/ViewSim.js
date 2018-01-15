// ViewSim.js

import alfrid, { GL } from 'alfrid';
import fs from 'shaders/sim.frag';


class ViewSim extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, fs);
		this.time = Math.random() * 0xFF;
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();

		this.shader.bind();
		this.shader.uniform('textureVel', 'uniform1i', 0);
		this.shader.uniform('texturePos', 'uniform1i', 1);
		this.shader.uniform('textureExtra', 'uniform1i', 2);

	}


	render(texturePos, textureVel, textureExtra, textureOrgPos, textureSave, textureFront, textureBack, shadowMtx0, shadowMtx1, hit) {
		this.time += .01;
		this.shader.bind();
		this.shader.uniform('time', 'float', this.time);
		this.shader.uniform('maxRadius', 'float', params.maxRadius);

		this.shader.uniform("uShadowMatrix0", "mat4", shadowMtx0);
		this.shader.uniform("uShadowMatrix1", "mat4", shadowMtx1);
		this.shader.uniform("uHit", "vec3", hit);
		this.shader.uniform("uHitRadius", "float", params.hitRadius);

		textureVel.bind(0);
		texturePos.bind(1);
		textureExtra.bind(2);

		this.shader.uniform("textureFront", "uniform1i", 3);
		textureFront.bind(3);
		this.shader.uniform("textureBack", "uniform1i", 4);
		textureBack.bind(4);
		this.shader.uniform("textureOrgPos", "uniform1i", 5);
		textureOrgPos.bind(5);
		this.shader.uniform("textureSave", "uniform1i", 6);
		textureSave.bind(6);

		GL.draw(this.mesh);
	}


}

export default ViewSim;