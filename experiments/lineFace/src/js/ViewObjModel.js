// ViewObjModel.js

import alfrid, { GL } from 'alfrid';
import Assets from './Assets';
import Scheduler from 'scheduling';
import vs from 'shaders/model.vert';
import fs from 'shaders/model.frag';

class ViewObjModel extends alfrid.View {
	
	constructor() {
		super(vs, fs);

		this.position = vec3.fromValues(0, 0, 0);
	}


	_init() {
		this.mesh = Assets.get('model');
	}


	render() {
		this.shader.bind();
		this.shader.uniform("uPosition", "vec3", this.position);
		this.shader.uniform("opacity", "float", 1);
		this.shader.uniform("uRotation", "float", -Scheduler.deltaTime);
		GL.draw(this.mesh);
	}


}

export default ViewObjModel;