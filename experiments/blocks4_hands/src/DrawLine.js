import { Geom, Draw } from "alfrid";

import vs from "shaders/line.vert";
import fs from "shaders/line.frag";

export default class DrawLine extends Draw {
  constructor() {
    super()
      .setMesh(Geom.cube(1, 1, 1))
      .useProgram(vs, fs)
      .uniform("uColor", [1, 1, 1]);
  }

  draw(mPointA, mPointB, mColor, mThickness = 1) {
    this.uniform("uThickness", mThickness)
      .uniform("uColor", mColor)
      .uniform("uPointA", mPointA)
      .uniform("uPointB", mPointB);

    super.draw();
  }
}
