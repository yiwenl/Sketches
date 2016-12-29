// ViewFloor.js

import alfrid, { GL } from 'alfrid';
import vs from '../shaders/floor.vert';
import fs from '../shaders/floor.frag';
import SoundManager from './SoundManager';

class ViewFloor extends alfrid.View {
	
	constructor() {
		super(vs, fs);
		this.lightOffset = new alfrid.EaseNumber(0);
	}


	_init() {
		const size = 20;
		this.mesh = alfrid.Geom.plane(size, size, 1, 'xz');
	}


	render() {
		const pos = [0, -params.maxRadius, 0];
		const data = SoundManager.getData();
		if(data.hasBeat) {
			this.lightOffset.setTo(data.sumPerc);
			this.lightOffset.value = 0;
		}


		this.shader.bind();
		this.shader.uniform("uPosition", "vec3", pos);
		this.shader.uniform("uSum", "float", SoundManager.getData().sumPerc);
		this.shader.uniform("uLightOffset", "float", this.lightOffset.value);
		GL.draw(this.mesh);
	}


}

export default ViewFloor;