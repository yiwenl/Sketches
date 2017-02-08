// ViewSim.js

import alfrid from 'alfrid';
import SoundManager from './SoundManager';
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
		this.shader.uniform('textureLife', 'uniform1i', 3);

	}


	render(textureVel, texturePos, textureExtra, textureLife, randomSpwan) {
		const data = SoundManager.getData();
		// console.log(data);

		let life = data.sum/params.maxSum;
		if(life > 1) {
			life = 1;
		}

		if(data.hasBeat) {
			const minLife = 0.3;
			if(life < minLife) life = minLife;	
		} else {
			life *= 0.1;
		}


		this.time += .01;
		this.shader.bind();
		this.shader.uniform('time', 'float', this.time);
		this.shader.uniform('maxRadius', 'float', params.maxRadius);
		this.shader.uniform("uLife", "float", life);
		this.shader.uniform("uLifeDecrease", "float", params.lifeDecrease);
		this.shader.uniform("uRotationSpeed", "float", params.rotationSpeed);
		this.shader.uniform("uRespwanRadius", "float", params.respwanRadius);
		this.shader.uniform("uSkipCount", "float", params.skipCount);
		this.shader.uniform("uRandomSpwan", "float", randomSpwan ? 1.0 : 0.0);
		// this.shader.uniform("uRandomSpwan", "float", 1);
		// console.log(data.sum / 200);
		textureVel.bind(0);
		texturePos.bind(1);
		textureExtra.bind(2);
		textureLife.bind(3);


		GL.draw(this.mesh);
	}


}

export default ViewSim;