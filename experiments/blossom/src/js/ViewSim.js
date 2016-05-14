// ViewSim.js

import alfrid from 'alfrid';
const GL = alfrid.GL;
const fsSim = require("../shaders/sim.frag");


class ViewSim extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, fsSim);
		this.time = Math.random() * 0xFF;
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();

		this.shader.bind();
		this.shader.uniform("textureVel", "uniform1i", 0);
		this.shader.uniform("texturePos", "uniform1i", 1);
		this.shader.uniform("textureExtra", "uniform1i", 2);
		this.shader.uniform("textureLife", "uniform1i", 3);

	}


	render(textureVel, texturePos, textureExtra, textureLife) {
		this.time += .01;
		this.shader.bind();
		this.shader.uniform("time", "float", this.time);
		this.shader.uniform("maxRadius", "float", params.maxRadius);
		this.shader.uniform("flyThreshold", "float", params.flyThreshold);
		textureVel.bind(0);
		texturePos.bind(1);
		textureExtra.bind(2);
		textureLife.bind(3);

		GL.draw(this.mesh);
	}


}

export default ViewSim;