// ViewSim.js

import alfrid from 'alfrid';
const GL = alfrid.GL;
const fsSim = require('../shaders/sim.frag');


class ViewSim extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, fsSim);
		this.time = Math.random() * 0xFF;
		this.offset = 0;
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();

		this.shader.bind();
		this.shader.uniform('textureVel', 'uniform1i', 0);
		this.shader.uniform('texturePos', 'uniform1i', 1);
		this.shader.uniform('textureExtra', 'uniform1i', 2);
		this.shader.uniform("textureHeight", "uniform1i", 3);
	}


	render(textureVel, texturePos, textureExtra, textureHeight) {
		this.time += .01;
		const timeScale = 2.0;
		this.offset = Math.sin(this.time * timeScale) * .5 + .5;
		this.offset = 0.97 - this.offset * 0.10;
		

		this.offset = 0.95;
		params.offset = this.offset;

		this.shader.bind();
		this.shader.uniform('time', 'float', this.time);
		this.shader.uniform('maxRadius', 'float', params.maxRadius);
		this.shader.uniform("uRange", "float", params.terrainSize/2);
		this.shader.uniform("uMaxHeight", "float", params.maxHeight);
		this.shader.uniform("uDecrease", "float", this.offset);
		textureVel.bind(0);
		texturePos.bind(1);
		textureExtra.bind(2);
		textureHeight.bind(3);


		GL.draw(this.mesh);
	}


}

export default ViewSim;