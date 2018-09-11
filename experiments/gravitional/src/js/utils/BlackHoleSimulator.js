// BlackHoleSimulator.js

import alfrid, { EventDispatcher } from 'alfrid';
import Config from '../Config';

class BlackHoleSimulator extends EventDispatcher {
	constructor(mAngle, mRadiusMultiplier = 1) {
		super();

		this._radiusMultiplier = mRadiusMultiplier;

		const r = 5;
		const { TEXTURE_SIZE } = Config;
		this._position = vec3.fromValues(r, 0, 0);
		this._center = vec3.fromValues(TEXTURE_SIZE/2, TEXTURE_SIZE/2, 0);
		
		const m = mat4.create();
		mat4.rotateY(m, m, mAngle);
		vec3.transformMat4(this._position, this._position, m);

		this._positionFinal = vec3.create();
		vec3.add(this._positionFinal, this._center, this._position);
		this._prePos = vec3.clone(this._positionFinal);

		this._speed = Config.rotationSpeed;
		this._mtxRot = mat4.create();
		mat4.rotateZ(this._mtxRot, this._mtxRot, this._speed);

		// this._radius = random(0.005, 0.06) * 0.5 * this._radiusMultiplier;
		this._radius = 0.0005 * this._radiusMultiplier;

		//	loop
		this._efIndex = alfrid.Scheduler.addEF(()=>this._update());
	}


	_update() {
		//	copy old position
		vec3.copy(this._prePos, this._positionFinal);

		//	calculate new pos
		vec3.transformMat4(this._position, this._position, this._mtxRot);
		vec3.add(this._positionFinal, this._center, this._position);


		const scale = 100;
	
		this.trigger('onDrag', {
			x:this._positionFinal[0],
			y:this._positionFinal[1],
			dx:(this._positionFinal[0] - this._prePos[0]) * scale,
			dy:(this._positionFinal[1] - this._prePos[1]) * scale,
			radius:this._radius
		});
	}


}

export default BlackHoleSimulator;