// ViewPortrail.js

import alfrid, { GL } from 'alfrid';
import Assets from './Assets';

import fs from 'shaders/portrait.frag';

const ratio = 449/600;

class ViewPortrait extends alfrid.View {
	
	constructor() {
		super(null, fs);
	}


	_init() {
		const num = 10;
		const width = 8;
		const height = width / ratio;
		this.mesh = alfrid.Geom.plane(width, height, num);
		this.texture = Assets.get('portrait');

		this.settings = {
			numPie:12,
			numRings:12
		}

		gui.add(this.settings, 'numPie', 1, 150).step(1);
		gui.add(this.settings, 'numRings', 1, 150).step(1);

	}


	render() {
		this.shader.bind();
		this.shader.uniform("uRatio", "float", ratio);
		this.shader.uniform("texture", "uniform1i", 0);
		this.texture.bind(0);

		this.shader.uniform(this.settings);

		GL.draw(this.mesh);
	}


}

export default ViewPortrait;