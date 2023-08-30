import { mat4, vec3, mat3 } from "gl-matrix";

class Camera {
  constructor() {
    this._mtxView = mat4.create();
    this._mtxProj = mat4.create();
    this._near = 0;
    this._far = 0;
    this._lookDir = vec3.create();
  }

  /**
   * Update the view matrix with look At function
   *
   * @param {vec3} mEye the position of the camera
   * @param {vec3} mCenter the target of the camera looking at
   * @param {vec3} mUp the up vector
   */
  lookAt(mEye, mCenter, mUp = [0, 1, 0]) {
    mat4.lookAt(this._mtxView, mEye, mCenter, mUp);
  }

  /**
   * Set the camera from view & projection matrix
   *
   * @param {mat4} mView the view matrix
   * @param {mat4} mProj the projection matrix
   */
  setFromViewProjection(mView, mProj) {
    mat4.copy(this._mtxView, mView);
    mat4.copy(this._mtxProj, mProj);
  }

  /**
   * Update the view matrix of the camera
   *
   * @param {mat4} mMtx the view matrix
   */
  setViewMatrix(mMtx) {
    mat4.copy(this._mtxView, mMtx);
  }

  /**
   * Update the projection matrix of the camera
   *
   * @param {mat4} mMtx the projection matrix
   */
  setProjectionMatrix(mMtx) {
    mat4.copy(this._mtxProj, mMtx);
  }

  /**
   * Update the matrices of the camera, to be overwriten
   *
   */
  _updateMatrices() {}

  /**
   * Get view matrix from camera
   *
   * @returns {mat4} the view matrix
   */
  get viewMatrix() {
    return this._mtxView;
  }

  /**
   * Get view matrix from camera
   *
   * @returns {mat4} the view matrix
   */
  get view() {
    return this._mtxView;
  }

  /**
   * Get projection matrix from camera
   *
   * @returns {mat4} the projection matrix
   */
  get projectionMatrix() {
    return this._mtxProj;
  }

  /**
   * Get projection matrix from camera
   *
   * @returns {mat4} the projection matrix
   */
  get projection() {
    return this._mtxProj;
  }

  /**
   * Get the position of the camera
   *
   * @returns {vec3} the position of the camera
   */
  get position() {
    const mtxInvert = mat4.create();
    mat4.invert(mtxInvert, this._mtxView);
    return [mtxInvert[12], mtxInvert[13], mtxInvert[14]];
  }

  /**
   * Get the pointing direction of the camera
   *
   * @returns {vec3} the pointing direction of the camera
   */
  get direction() {
    const mtxRot = mat3.create();
    mat3.fromMat4(mtxRot, this._mtxView);
    mat3.transpose(mtxRot, mtxRot);
    vec3.transformMat3(this._lookDir, [0, 0, -1], mtxRot);
    vec3.normalize(this._lookDir, this._lookDir);

    return this._lookDir;
  }

  /**
   * Set the near clip plane of the camera
   *
   * @param {float} mValue the near clip plane distance
   */
  set near(mValue) {
    this._near = mValue;
    this._updateMatrices();
  }

  /**
   * Get the near clip plane of the camera
   *
   * @returns {float} near clip plane distance
   */
  get near() {
    return this._near;
  }

  /**
   * Set the far clip plane of the camera
   *
   * @param {float} mValue the far clip plane distance
   */
  set far(mValue) {
    this._far = mValue;
    this._updateMatrices();
  }

  /**
   * Get the far clip plane of the camera
   *
   * @returns {float} far clip plane distance
   */
  get far() {
    return this._far;
  }
}

export { Camera };
