// Camera.js

import glm from 'gl-matrix';

class Camera {
	constructor() {
		//	VIEW MATRIX
		this._matrix = glm.mat4.create();

		//	PROJECTION MATRIX
		this._projection = glm.mat4.create();

		//	POSITION OF CAMERA
		this.position = glm.vec3.create();
	}


	lookAt(aEye, aCenter, aUp = [0, 1, 0]) {
		this._eye = vec3.clone(aEye);
		this._center = vec3.clone(aCenter);

		glm.vec3.copy(this.position, aEye);
		glm.mat4.identity(this._matrix);
		glm.mat4.lookAt(this._matrix, aEye, aCenter, aUp);
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