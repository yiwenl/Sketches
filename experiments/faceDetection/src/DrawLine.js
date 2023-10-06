import { GL, Draw, Mesh } from "alfrid";

import vs from "shaders/line.vert";
import fs from "shaders/line.frag";

export default class DrawLine extends Draw {
  constructor() {
    super();

    const mesh = new Mesh(GL.LINES)
      .bufferVertex([
        [0, 0, 0],
        [1, 1, 1],
      ])
      .bufferIndex([0, 1]);

    this.setMesh(mesh).useProgram(vs, fs);
  }

  draw(mPointA, mPointB, mColor = [1, 1, 1]) {
    this.uniform("uPointA", mPointA)
      .uniform("uPointB", mPointB)
      .uniform("uColor", mColor);
    super.draw();
  }
}
