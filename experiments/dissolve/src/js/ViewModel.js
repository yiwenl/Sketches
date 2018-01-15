// ViewModel.js

import alfrid, { GL } from 'alfrid';
import Assets from './Assets';
import fs from 'shaders/model.frag';

import vs from 'shaders/model.vert';
import fsPos from 'shaders/modelPos.frag';

class ViewModel extends alfrid.View {
	
	constructor() {
		super(vs, fs);
		this.shaderPos = new alfrid.GLShader(vs, fsPos);
	}


	_init() {
		this.mesh = Assets.get('venus');
		this.texture = Assets.get('aomap');
	}


	render(hit=[999, 999, 999]) {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		this.texture.bind(0);
		this.shader.uniform("uHit", "vec3", hit);
		this.shader.uniform("uLightPos", "vec3", params.lightPos);
		this.shader.uniform("uHitRadius", "float", params.hitRadius);
		GL.draw(this.mesh);
	}


	renderPosition() {
		this.shaderPos.bind();
		GL.draw(this.mesh);
	}


}

export default ViewModel;