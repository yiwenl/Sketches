// Camera.js

import { mat4, mat3, quat } from 'gl-matrix';

class Camera {
	constructor() {
		//	VIEW MATRIX
		this._matrix = mat4.create();

		//	FOR TRANSFORM FROM ORIENTATION
		this._quat = quat.create();
		this._orientation = mat4.create();

		//	PROJECTION MATRIX
		this._projection = mat4.create();

		//	POSITION OF CAMERA
		this.position = vec3.create();
	}


	lookAt(aEye, aCenter, aUp = [0, 1, 0]) {
		this._eye = vec3.clone(aEye);
		this._center = vec3.clone(aCenter);

		vec3.copy(this.position, aEye);
		mat4.identity(this._matrix);
		mat4.lookAt(this._matrix, aEye, aCenter, aUp);
	}


	setFromOrientation(x, y, z, w) {
		quat.set(this._quat, x, y, z, w);
		mat4.fromQuat(this._orientation, this._quat);
		mat4.translate(this._matrix, this._orientation, this.positionOffset);
	}


	setProjection(mProj) {
		this._projection = mat4.clone(mProj);
	}


	setView(mView) {
		this._matrix = mat4.clone(mView);
	}
	

	setFromViewProj(mView, mProj) {
		this.setView(mView);
		this.setProjection(mProj);
	}


	//	GETTERS 

	get matrix() {
		return this._matrix;
	}

	get viewMatrix() {
		return this._matrix;
	}


	get projection() {
		return this._projection;
	} 

	get projectionMatrix() {
		return this._projection;
	} 


	get eye() {	return this._eye;	}

	get center() {	return this._center;	}
}


export default Camera;