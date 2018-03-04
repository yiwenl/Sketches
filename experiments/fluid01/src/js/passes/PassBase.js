// PassBase.js

import alfrid, { GL } from 'alfrid';
import getMesh from '../utils/getMesh';
import fs from 'shaders/base.frag';

class PassBase extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, fs);

		this._seedTime = Math.random() * 0xFF;

		this.baseStrength = 0.017;
	}


	_init() {
		this.mesh = getMesh();
	}


	render(mTarget, mTexture) {
		this.shader.bind();
		this.shader.uniform('uTime', 'float', alfrid.Scheduler.deltaTime + this._seedTime);

		this.shader.uniform('uTarget', 'uniform1i', 0);
		mTarget.bind(0);

		this.shader.uniform('texture', 'uniform1i', 1);
		mTexture.bind(1);

		this.shader.uniform('uBaseStrength', 'float', this.baseStrength);

		GL.draw(this.mesh);
	}


}

export default PassBase;