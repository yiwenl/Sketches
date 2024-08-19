import { Camera } from "./Camera";
import { Ray } from "../math/Ray";
import { vec3, mat4 } from "gl-matrix";

class CameraPerspective extends Camera {
  constructor(mFov, mAspectRatio, mNear, mFar) {
    super();
    this._fov = 0;
    this._ratio = 0;
    this.setPerspective(mFov, mAspectRatio, mNear, mFar);
  }

  /**
   * Update the projection matrix with perspective function
   *
   * @param {float} mFov the field of view
   * @param {float} mAspectRatio the aspect ratio
   * @param {float} mNear the near clip plane distance
   * @param {float} mFar the far clip plane distance
   */
  setPerspective(mFov, mAspectRatio, mNear, mFar) {
    mat4.perspective(this._mtxProj, mFov, mAspectRatio, mNear, mFar);
    this._near = mNear;
    this._far = mFar;
    this._fov = mFov;
    this._ratio = mAspectRatio;
  }

  /**
   * Set the aspect ratio of the camera
   *
   * @param {float} mAspectRatio the aspect ratio
   */
  setAspectRatio(mAspectRatio) {
    this._ratio = mAspectRatio;
    this._updateMatrices();
  }

  /**
   * Generate a ray from the camera
   *
   * @param {vec3} mScreenPosition the screen space position
   * @param {Ray} mRay the ray to overwrite
   * @returns {Ray} the ray
   */
  generateRay(mScreenPosition, mRay) {
    const mInverseViewProj = mat4.create();
    const cameraDir = vec3.create();

    const proj = this._mtxProj;
    const view = this._mtxView;

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

  /**
   * Update the matrices after resetting the near or far clip plane
   *
   */
  _updateMatrices() {
    this.setPerspective(this._fov, this._ratio, this._near, this._far);
  }
}

export { CameraPerspective };
