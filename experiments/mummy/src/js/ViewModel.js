// ViewModel.js

import alfrid, { GL } from 'alfrid';

import Assets from './Assets';
import Config from './Config';

import vs from 'shaders/model.vert';
import fs from 'shaders/model.frag';


class ViewModel extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		this.mesh = Assets.get('model');
	}


	render() {
		this.shader.bind();
		this.shader.uniform("uScale", "float", Config.modelScale);
		GL.draw(this.mesh);
	}


}

export default ViewModel;