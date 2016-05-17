// ViewNoise.js
import alfrid, { GL } from 'alfrid';
const fs = require('../shaders/noise.frag');

class ViewNoise extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, fs);
		this.time = Math.random();
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();
	}


	render(texture) {
		this.time += 0.002;
		this.shader.bind();
		this.shader.uniform("time", "float", this.time);
		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);
		GL.draw(this.mesh);
	}

}

export default ViewNoise;