// ViewSim.js

import alfrid from 'alfrid';
const GL = alfrid.GL;
const fsSim = require('../shaders/sim.frag');


class ViewSim extends alfrid.View {
	
	constructor(mesh) {
		super(alfrid.ShaderLibs.bigTriangleVert, fsSim);
		this.mesh = mesh;
		this.time = 0.0;
	}


	_init() {
		// this.mesh = alfrid.Geom.bigTriangle();

		this.shader.bind();
		this.shader.uniform('textureVel', 'uniform1i', 0);
		this.shader.uniform('texturePos', 'uniform1i', 1);
		this.shader.uniform('textureExtra', 'uniform1i', 2);
		this.shader.uniform('maxRadius', 'float', params.maxRadius);

	}


	render(textureVel, texturePos, textureExtra, hit, isMouseDown) {
		this.time += .01;
		this.shader.bind();
		this.shader.uniform('time', 'float', this.time);
		
		textureVel.bind(0);
		texturePos.bind(1);
		textureExtra.bind(2);

		let f = isMouseDown ? 10.0 : 0.0;
		const r = isMouseDown ? 3.0 : 2.0;
		this.shader.uniform("uHit", "vec3", hit);
		this.shader.uniform("float", "uIsMouseDown", f);
		this.shader.uniform("uMinRadius", "float", r);


		GL.draw(this.mesh);
	}


}

export default ViewSim;