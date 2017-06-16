// ViewSim.js

import alfrid from 'alfrid';
const GL = alfrid.GL;
const fsSim = require('../shaders/sim.frag');


class ViewSim extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, fsSim);
		this.time = Math.random() * 0xFF;

		this.settings = {
			uNoiseScale: 0.05,
			uSpeed:1.8,
			maxRadius: 12
		}

		gui.add(this.settings, 'uSpeed', .0, 10);
		gui.add(this.settings, 'uNoiseScale', .0, .5);
		gui.add(this.settings, 'maxRadius', 0.0, 20.0);
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();

		this.shader.bind();
		this.shader.uniform('textureVel', 'uniform1i', 0);
		this.shader.uniform('texturePos', 'uniform1i', 1);
		this.shader.uniform('textureExtra', 'uniform1i', 2);

	}


	render(textureVel, texturePos, textureExtra) {
		this.time += .01;
		this.shader.bind();
		this.shader.uniform('time', 'float', this.time);
		this.shader.uniform(this.settings);
		textureVel.bind(0);
		texturePos.bind(1);
		textureExtra.bind(2);


		GL.draw(this.mesh);
	}


}

export default ViewSim;