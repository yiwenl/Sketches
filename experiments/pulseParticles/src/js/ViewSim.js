// ViewSim.js

import alfrid from 'alfrid';
const GL = alfrid.GL;
const fsSim = require('../shaders/sim.frag');

var random = function(min, max) { return min + Math.random() * (max - min);	}

class ViewSim extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, fsSim);
		this.time = Math.random() * 0xFF;
		this._force = 0;
		this._offset = 0;
		this._emitPoint = [0, random(5, 10), 0];

		this._isResetting = false;
		this.reset();
	}


	reset(mForce = 0) {
		const startY = -20;
		const range = 0;
		this._emitPoint = [0, startY + range * mForce, 0];
		// this._force.setTo(mForce);
		this._force = Math.random();
		this._offset = 1;
		// this._force.value = 0;
		this._isResetting = true;
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();

		this.shader.bind();
		this.shader.uniform('textureVel', 'uniform1i', 0);
		this.shader.uniform('texturePos', 'uniform1i', 1);
		this.shader.uniform('textureExtra', 'uniform1i', 2);
		this.shader.uniform('textureOrgPos', 'uniform1i', 3);

	}


	render(textureVel, texturePos, textureExtra, textureOrgPos) {
		this.time += .01;
		this._offset -= 0.01;
		if(this._offset < 0) this._offset = 0;
		this.shader.bind();
		this.shader.uniform('time', 'float', this.time);
		this.shader.uniform('maxRadius', 'float', params.maxRadius);
		textureVel.bind(0);
		texturePos.bind(1);
		textureExtra.bind(2);
		textureOrgPos.bind(3);

		this.shader.uniform("uEmitPoint", "vec3", this._emitPoint);
		this.shader.uniform("uForce", "float", this._force);
		this.shader.uniform("uResetting", "float", this._isResetting ? 1 : 0);
		this.shader.uniform("uOffset", "float", this._offset);

		GL.draw(this.mesh);

		this._isResetting = false;
	}


}

export default ViewSim;