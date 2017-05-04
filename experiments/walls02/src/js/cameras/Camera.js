// Camera.js

import { mat4, vec3 } from 'gl-matrix';

class Camera {

	constructor() {
		this._mtxView = mat4.create();
		this._mtxProj = mat4.create();


		this._position = vec3.create();
		this._target = vec3.create();
	}



	lookAt(mPosition, mTarget, mUp = [0, 1, 0]) {	
		vec3.copy(this._position, mPosition);
		vec3.copy(this._target, mTarget);

		mat4.identity(this._mtxView);
		mat4.lookAt(this._mtxView, mPosition, mTarget, mUp);
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



	setPerspective(mFov, mAspectRatio, mNear=0.1, mFar=10000) {
		
		this._fov         = mFov;
		this._near        = mNear;
		this._far         = mFar;
		this._aspectRatio = mAspectRatio;
		mat4.perspective(this._mtxProj, mFov, mAspectRatio, mNear, mFar);
	}


	//	GETTER AND SETTERS
	get viewMatrix() {	return this._mtxView;	}

	get projectionMatrix() {	return this._mtxProj;	}

	get view() {	return this._mtxView;	}

	get projection() {	return this._mtxProj;	}


	get position() {	return this._position;	}

	get target() {	return this._target;	}
}


export default Camera;