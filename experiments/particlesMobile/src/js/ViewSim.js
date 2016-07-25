// ViewSim.js

import alfrid from 'alfrid';
const GL = alfrid.GL;
const fsSim = require('../shaders/sim.frag');


class ViewSim extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, fsSim);
		this.time = Math.random() * 0xFF;
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();

		this.shader.bind();
		this.shader.uniform('textureVel', 'uniform1i', 0);
		this.shader.uniform('texturePos', 'uniform1i', 1);
		this.shader.uniform('textureExtra', 'uniform1i', 2);

	}


	render(textureVel, texturePos, textureExtra, mHit, mCount) {
		this.time += .01;
		this.shader.bind();
		this.shader.uniform('time', 'float', this.time);
		this.shader.uniform('maxRadius', 'float', params.maxRadius);
		this.shader.uniform("uHit", "vec3", mHit);
		let strength = (mCount - 10) / 50;
		if(strength < 0) strength = 0;
		else if(strength > 1) strength = 1;
		// console.log('Strength : ', strength);
		this.shader.uniform("uStrength", "float", strength);

		textureVel.bind(0);
		texturePos.bind(1);
		textureExtra.bind(2);


		GL.draw(this.mesh);
	}


}

export default ViewSim;