import { Camera } from "./Camera";
import { mat4 } from "gl-matrix";

class CameraOrtho extends Camera {
  constructor(left, right, top, bottom, near = 0.1, far = 100) {
    super();

    this._left = 0;
    this._right = 0;
    this._top = 0;
    this._bottom = 0;

    this.ortho(left, right, top, bottom, near, far);
  }

  /**
   * Update the projection matrix with orthogonal function
   *
   * @param {float} left the left boundary
   * @param {float} right the right boundary
   * @param {float} top the top boundary
   * @param {float} bottom the bottom boundary
   * @param {float} near the near clip plane distance
   * @param {float} far the far clip plane distance
   */
  ortho(left, right, top, bottom, near = 0.1, far = 100) {
    this.left = left;
    this.right = right;
    this.top = top;
    this.bottom = bottom;
    mat4.ortho(this._mtxProj, left, right, bottom, top, near, far);

    // save state
    this._left = left;
    this._right = right;
    this._top = top;
    this._bottom = bottom;
    this._near = near;
    this._far = far;
  }

  /**
   * Update the matrices after resetting the near or far clip plane
   *
   */
  _updateMatrices() {
    this.ortho(
      this._left,
      this._right,
      this._top,
      this._bottom,
      this._near,
      this._far
    );
  }
}

export { CameraOrtho };
