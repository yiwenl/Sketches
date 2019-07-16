// ViewSim.js

import alfrid, { GL } from 'alfrid';
import fs from 'shaders/sim.frag';
import Config from './Config';
import Time from './Time';
import FlowControl from './FlowControl';


class ViewSim extends alfrid.View {
	
	constructor(mSpeed=1, mLife=1, mIsLine=false) {
		super(alfrid.ShaderLibs.bigTriangleVert, fs);
		this.time = Math.random() * 0xFF;
		this._speed = mSpeed;
		this._life = mLife;
		this._isLine = mIsLine;

		console.log('isLine ? ', this._isLine);
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();

		this.shader.bind();
		this.shader.uniform('textureVel', 'uniform1i', 0);
		this.shader.uniform('texturePos', 'uniform1i', 1);
		this.shader.uniform('textureExtra', 'uniform1i', 2);
		this.shader.uniform("textureOrg", "uniform1i", 3);
		

	}


	render(textureVel, texturePos, textureExtra, textureOrg, mIsLine=false) {
		// this.time += .01;
		this.shader.bind();
		this.shader.uniform('time', 'float', Time.current);
		this.shader.uniform('maxRadius', 'float', Config.maxRadius);

		

		this.shader.uniform("uPullingForce", "float", Config.pullingForce);
		this.shader.uniform("uSpeed", "float", this._speed);
		this.shader.uniform("uLifeScale", "float", this._life);
		this.shader.uniform("uIsLine", "float", mIsLine ? 1.0 : 0.0);
		this.shader.uniform("uBurstForce", "float", Config.burstForce);
		this.shader.uniform("uSpeedOffset", "float", FlowControl.speedOffset);
		textureVel.bind(0);
		texturePos.bind(1);
		textureExtra.bind(2);
		textureOrg.bind(3);

		//	Flow
		let speedMultiplier = this._isLine ? 2 : 1;
		let speed;
		if(FlowControl.speedOffset > 1) {
			speed = (FlowControl.speedOffset - 1) * speedMultiplier + 1;
		}  else {
			speed = FlowControl.speedOffset;
		}
		
		this.shader.uniform("uGeneralSpeed", "float", FlowControl.speedOffset );
		this.shader.uniform("uSpwan", "float", FlowControl.respwan ? 1.0 : 0.0);

		GL.draw(this.mesh);
	}


}

export default ViewSim;