// ViewDome.js

import alfrid, { GL, Geom, TweenNumber } from 'alfrid';

import vs from '../shaders/dome.vert';
import fs from '../shaders/dome.frag';

class ViewDome extends alfrid.View {
	
	constructor() {
		super(vs, fs);

		this.time = 0;
	}


	_init() {
		const { terrainSize } = params;
		this.radius = terrainSize * 0.75
		this.mesh = Geom.sphere(this.radius, 125, true);

		this.waveFront = new TweenNumber(0);
		this.waveLength = 3;
		this.waveHeight = 5;
		this.waveCenter = [0, -.5, -1];
	}


	render(textureCurr, textureNext) {
		this.time += 0.01;
		this.waveFront.value = (Math.sin(this.time) * .5 + .5) * this.radius * 4;
		this.shader.bind();
		this.shader.uniform("textureCurr", "uniform1i", 0);
		textureCurr.bind(0);
		this.shader.uniform("textureNext", "uniform1i", 1);
		textureNext.bind(1);

		this.shader.uniform("uRadius", "float", this.radius);
		this.shader.uniform("uWaveCenter", "vec3", this.waveCenter);
		this.shader.uniform("uWaveFront", "float", (Math.sin(this.time) * .5 + .5) * this.radius * 2.1);
		this.shader.uniform("uWaveLength", "float", this.waveLength);
		this.shader.uniform("uWaveHeight", "float", this.waveHeight);

		GL.draw(this.mesh);
	}


}

export default ViewDome;