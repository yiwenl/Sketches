// ViewSim.js

import alfrid, { GL } from 'alfrid';
import fs from 'shaders/sim.frag';
import Config from './Config';


class ViewSim extends alfrid.View {
	
	constructor() {
		const _fs = fs.replace('${NUM}', Config.numParticles);
		super(alfrid.ShaderLibs.bigTriangleVert, _fs);
		this.time = Math.random() * 0xFF;
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();

		this.shader.bind();
		this.shader.uniform('textureVel', 'uniform1i', 0);
		this.shader.uniform('texturePos', 'uniform1i', 1);
		this.shader.uniform('textureExtra', 'uniform1i', 2);

	}


	render(textureVel, texturePos, textureExtra, mTouch, mTouchSpeed) {
		this.time += .01;
		this.shader.bind();
		this.shader.uniform('time', 'float', this.time);
		this.shader.uniform('maxRadius', 'float', Config.maxRadius);

		this.shader.uniform('uRadius', 'float', Config.radius);
		this.shader.uniform("uSpeed", "float", Config.speed);
		this.shader.uniform("uMinThreshold", "float", Config.minThreshold);
		this.shader.uniform("uMaxThreshold", "float", Config.maxThreshold);
		textureVel.bind(0);
		texturePos.bind(1);
		textureExtra.bind(2);

		this.shader.uniform("uTouch", "vec3", mTouch);
		this.shader.uniform("uTouchSpeed", "float", mTouchSpeed);


		GL.draw(this.mesh);
	}


}

export default ViewSim;