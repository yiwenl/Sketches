import { GL } from "../core/GL";
import { DrawLine } from "./DrawLine";
import { DrawBall } from "./DrawBall";
const { mat4, vec4 } = require("gl-matrix");

class DrawCamera {
  constructor(mGL) {
    const _GL = mGL || GL;
    this._dLine = new DrawLine(_GL);
    this._dBall = new DrawBall(_GL);

    this.mtx = mat4.create();

    this.color = [1, 1, 1];
    this.opacity = 0.75;

    this._points = [
      [1, 1, -1, 1],
      [-1, 1, -1, 1],
      [1, -1, -1, 1],
      [-1, -1, -1, 1],

      [1, 1, 1, 1],
      [-1, 1, 1, 1],
      [1, -1, 1, 1],
      [-1, -1, 1, 1],
    ];

    this._lines = [
      [0, 1],
      [1, 3],
      [3, 2],
      [2, 0],

      [4, 5],
      [5, 7],
      [7, 6],
      [6, 4],

      [0, 4],
      [1, 5],
      [2, 6],
      [3, 7],
    ];
  }

  draw(mCamera, mColor, mOpacity) {
    const color = mColor || this.color;
    const opacity = mOpacity || this.opacity;

    mat4.identity(this.mtx, this.mtx);
    mat4.mul(this.mtx, mCamera.projection, mCamera.view);
    mat4.invert(this.mtx, this.mtx);

    const points = this._points.map((pos) => {
      const p = vec4.clone(pos);
      vec4.transformMat4(p, p, this.mtx);

      p[0] /= p[3];
      p[1] /= p[3];
      p[2] /= p[3];
      return [p[0], p[1], p[2]];
    });

    const s = 0.02;
    points.forEach((p) => {
      this._dBall.draw(p, [s, s, s], color, opacity);
    });

    this._lines.forEach((l) => {
      this._dLine.draw(points[l[0]], points[l[1]], color, opacity);
    });
  }
}

export { DrawCamera };
