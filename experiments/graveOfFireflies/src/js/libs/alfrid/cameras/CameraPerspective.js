// CameraPerspective.js

import Camera from './Camera';
import Ray from '../math/Ray';
import glm from 'gl-matrix';


const mat4 = glm.mat4;
const vec3 = glm.vec3;

const mInverseViewProj = mat4.create();
const cameraDir = vec3.create();


class CameraPerspective extends Camera {

	setPerspective(mFov, mAspectRatio, mNear, mFar) {
		
		this._fov         = mFov;
		this._near        = mNear;
		this._far         = mFar;
		this._aspectRatio = mAspectRatio;
		glm.mat4.perspective(this._projection, mFov, mAspectRatio, mNear, mFar);

		// this._frustumTop = this._near * Math.tan(this._fov * 0.5);
		// this._frustumButtom = -this._frustumTop;
		// this._frustumRight = this._frustumTop * this._aspectRatio;
		// this._frustumLeft = -this._frustumRight;
	}


	setAspectRatio(mAspectRatio) {
		this._aspectRatio = mAspectRatio;
		glm.mat4.perspective(this.projection, this._fov, mAspectRatio, this._near, this._far);
	}


	generateRay(mScreenPosition, mRay) {
		const proj = this.projectionMatrix;
		const view = this.viewMatrix;

		mat4.multiply(mInverseViewProj, proj, view);
		mat4.invert(mInverseViewProj, mInverseViewProj);

		vec3.transformMat4(cameraDir, mScreenPosition, mInverseViewProj);
		vec3.sub(cameraDir, cameraDir, this.position);
		vec3.normalize(cameraDir, cameraDir);

		if (!mRay) {
			mRay = new Ray(this.position, cameraDir);
		} else {
			mRay.origin = this.position;
			mRay.direction = cameraDir;
		}


		return mRay;
	}
}


export default CameraPerspective;