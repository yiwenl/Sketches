// AnimateCube.js

import alfrid, { GL } from 'alfrid';
import Cube4D from './Cube4D';
import getRandomPos from './utils/getRandomPos';
import getRandomRotation from './utils/getRandomRotation';

var random = function(min, max) { return min + Math.random() * (max - min);	}
const { cos, pow, PI } = Math;


const exponentialInOut = function(t) {
  return t == 0.0 || t == 1.0
    ? t
    : t < 0.5
      ? +0.5 * pow(2.0, (20.0 * t) - 10.0)
      : -0.5 * pow(2.0, 10.0 - (t * 20.0)) + 1.0;
}

const cubicInOut = function(t) {
  return t < 0.5
    ? 4.0 * t * t * t
    : 0.5 * pow(2.0 * t - 2.0, 3.0) + 1.0;
}

const quadraticInOut = function(t) {
  let p = 2.0 * t * t;
  return t < 0.5 ? p : -p + (4.0 * t) - 1.0;
}

const sineInOut = function(t) {
  return -0.5 * (cos(PI * t) - 1.0);
}

function getRandomEase() {
	const funcs = [exponentialInOut, cubicInOut, quadraticInOut, sineInOut];

	return funcs[Math.floor(Math.random() * funcs.length)];
}



class AnimateCube extends Cube4D {
	
	constructor(mPosition, mMovingDist = 1.25) {
		super(mPosition);
		this._func = getRandomEase();
		this._movingDistance = mMovingDist;

		this._quat = quat.create();
		this._quatMask = quat.create();

		this._quatTarget = quat.create();
		this._quatMaskTarget = quat.create();

		this._quatCurr = quat.create();
		this._quatMaskCurr = quat.create();

		this._pos = vec3.clone(mPosition);
		this._posTarget = vec3.clone(mPosition);

		this._posMask = vec3.fromValues(0, 0, 0);
		this._posMaskTarget = vec3.fromValues(0, 0, 0);

		this._offset = 1;
		this.speed = random(0.005, 0.02);
		this._hasCompleted = false;
	}


	update() {
		super.update();
		if(!this._hasCompleted) {
			this._offset += this.speed;
			this._offset = Math.min(this._offset, 1.0);	

			if(this._offset === 1) {
				if(!this._hasCompleted) {
					this._hasCompleted = true;
					this._isDirty= true;
				}	
			} else {
				this._isDirty = true;
			}
		}
		
	}


	_updateRotationMatrices() {
		const t = this._func(this._offset);
		quat.slerp(this._quatCurr, this._quat, this._quatTarget, t);
		mat4.fromQuat(this._mtxRotation, this._quatCurr);
		mat4.invert(this._mtxRotationInvert, this._mtxRotation);

		quat.slerp(this._quatMaskCurr, this._quatMask, this._quatMaskTarget, t);
		mat4.fromQuat(this._mtxRotationMask, this._quatMaskCurr);
		mat4.invert(this._mtxRotationMaskInvert, this._mtxRotationMask);

		vec3.lerp(this._position, this._pos, this._posTarget, t);
		vec3.lerp(this._positionMask, this._posMask, this._posMaskTarget, t * t);
	}


	moveTo(mPos, mPosMask, mRot, mRotMask, speedMultiplier=1) {
		this._func = getRandomEase();
		this.speed = random(0.005, 0.02) * speedMultiplier;

		this._offset = 0;
		this._hasCompleted = false;

		vec3.copy(this._pos, this._position);
		vec3.copy(this._posTarget, mPos);

		vec3.copy(this._posMask, this._positionMask);
		vec3.copy(this._posMaskTarget, mPosMask);


		quat.copy(this._quat, this._quatCurr);
		quat.copy(this._quatMask, this._quatMaskCurr);

		quat.copy(this._quatTarget, mRot);
		quat.copy(this._quatMaskTarget, mRotMask);
	}


	setTo(mPos, mPosMask, mRot, mRotMask) {
		this._func = getRandomEase();
		this.speed = random(0.005, 0.02);

		this._offset = 1;
		this._hasCompleted = false;

		vec3.copy(this._pos, this._position);
		vec3.copy(this._posTarget, mPos);

		vec3.copy(this._posMask, this._positionMask);
		vec3.copy(this._posMaskTarget, mPosMask);


		quat.copy(this._quat, this._quatCurr);
		quat.copy(this._quatMask, this._quatMaskCurr);

		quat.copy(this._quatTarget, mRot);
		quat.copy(this._quatMaskTarget, mRotMask);
	}


	randomTo() {
		const d0 = 2.5;
		const d1 = this._movingDistance;

		const pos = this.position;
		const posMask = vec3.fromValues(random(-d1, d1), random(-d1, d1), random(-d1, d1));

		const rot = getRandomRotation();
		const rotMask = getRandomRotation();

		this.moveTo(pos, posMask, rot, rotMask);	

		
		this.scale = random(.5, 1);


		const s = .4;
		const e = .6;
		this.dx = random(s, e);
		this.dy = random(s, e);
		this.dz = random(s, e);
	}


	set offset(value) {
		this._offset = value;
		this._isDirty = true;
	}

	get offet() {
		return this._offset;
	}


	get quatRotation() {
		return this._quatCurr;
	}

}

export default AnimateCube;