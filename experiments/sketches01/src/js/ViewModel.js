// ViewModel.js

import alfrid, { GL } from 'alfrid';
import Assets from './Assets';
import fs from 'shaders/test.frag';

class ViewModel extends alfrid.View {
	
	constructor() {
		super(null, fs);
	}


	_init() {
		// this.mesh = Assets.get('model');
		// this.mesh = alfrid.Geom.cube(1, 1, 1);
		this.mesh = alfrid.Geom.sphere(1, 24);
	}


	render() {
		this.shader.bind();
		GL.draw(this.mesh);
	}


}

export default ViewModel;