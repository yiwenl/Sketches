// ViewSim.js

import alfrid, { GL } from 'alfrid';
import VRUtils from './utils/VRUtils';
import fs from 'shaders/sim.frag';


class ViewSim extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, fs);
		this.time = Math.random() * 0xFF;
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();

		this.shader.bind();
		this.shader.uniform('textureVel', 'uniform1i', 0);
		this.shader.uniform('texturePos', 'uniform1i', 1);
		this.shader.uniform('textureExtra', 'uniform1i', 2);

		const { ringRadius, ringSize } = params;
		const uInnerRadius = ringRadius - ringSize;
		const uOuterRadius = ringRadius + ringSize;

		this.shader.uniform({
			uInnerRadius,
			uOuterRadius,
			uRingRadius:ringRadius,
			uRingSize:ringSize
		});

		this._force0 = new alfrid.EaseNumber(0);
		this._force1 = new alfrid.EaseNumber(0);

		this.shader.bind();
		this.shader.uniform("uDir0", "vec3", [0, 0, -1]);
		this.shader.uniform("uDir1", "vec3", [0, 0, -1]);

	}

	_checkGamepad() {
		const { gamePads } = VRUtils;

		gamePads.forEach( (gamepad, i) => {
			this[`_force${i}`].value = gamepad.isTriggerPressed ? 1 : 0;
			this.shader.uniform(`uDir${i}`, "vec3", gamepad.dir);
		});
	}


	render(textureVel, texturePos, textureExtra, hit0, hit1) {

		this.time += .01;
		this.shader.bind();

		this._checkGamepad();

		this.shader.uniform('time', 'float', this.time);
		this.shader.uniform('maxRadius', 'float', params.maxRadius);
		textureVel.bind(0);
		texturePos.bind(1);
		textureExtra.bind(2);


		this.shader.uniform("uHit0", "vec3", hit0);
		this.shader.uniform("uHit1", "vec3", hit1);
		this.shader.uniform("uForce0", "float", this._force0.value);
		this.shader.uniform("uForce1", "float", this._force1.value);


		GL.draw(this.mesh);
	}


}

export default ViewSim;