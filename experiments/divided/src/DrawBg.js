import { GL, Draw, Geom, Object3D } from "alfrid";

import vs from "shaders/basic.vert";
import fs from "shaders/sphere-bg.frag";

export default class DrawBg extends Draw {
  constructor() {
    super()
      .setMesh(Geom.sphere(50, 24 * 2, true))
      .useProgram(vs, fs);

    this.container = new Object3D();
  }

  draw() {
    GL.setModelMatrix(this.container.matrix);
    super.draw();
  }
}
