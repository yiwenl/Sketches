// ViewStars.js

import alfrid, { GL } from 'alfrid';
import Assets from './Assets';
import vs from '../shaders/stars.vert';
import fs from '../shaders/stars.frag';

class ViewStars extends alfrid.View {
	
	constructor() {
		super(vs, fs);
		this.time = Math.random() * 0xFF;
	}


	_init() {
		this.mesh = alfrid.Geom.sphere(params.worldSize, 48, true);
		this.texture = Assets.get('starsmap');

		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		this.shader.uniform("uPosition", "vec3", [0, 1, 0]);
		this.shader.uniform(params.fog);
	}


	render() {
		this.time -= 0.0005;
		this.shader.bind();
		this.texture.bind(0);

		this.shader.uniform("uRotation", "float", this.time);
		GL.draw(this.mesh);
	}


}

export default ViewStars;