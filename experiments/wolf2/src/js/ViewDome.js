// ViewDome.js

import alfrid, { GL, Geom, EaseNumber } from 'alfrid';

import vs from '../shaders/dome.vert';
import fs from '../shaders/dome.frag';

class ViewDome extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		const { terrainSize } = params;
		this.radius = terrainSize * 0.75
		this.mesh = Geom.sphere(this.radius, 125, true);

		this.waveFront = new EaseNumber(-5, 0.01);
		this.waveLength = 5;
		this.waveHeight = 8;
		this.waveCenter = [0, -.5, -1];
		this.percent = 0;
	}

	switch(center) {
		this.waveCenter = [center[0],center[1],center[2]];
		this.waveFront.setTo(this.radius * 2.0);
		this.waveFront.value = -5.0;
	}


	render(textureCurr, textureNext) {
		this.percent = 1.0 - (this.waveFront.value + 5.0) / (this.radius * 2 + 5);
		this.shader.bind();
		this.shader.uniform("textureCurr", "uniform1i", 0);
		textureCurr.bind(0);
		this.shader.uniform("textureNext", "uniform1i", 1);
		textureNext.bind(1);

		this.shader.uniform("uRadius", "float", this.radius);
		this.shader.uniform("uWaveCenter", "vec3", this.waveCenter);
		this.shader.uniform("uWaveFront", "float", this.waveFront.value);
		this.shader.uniform("uWaveLength", "float", this.waveLength);
		this.shader.uniform("uWaveHeight", "float", this.waveHeight);

		GL.draw(this.mesh);
	}


}

export default ViewDome;