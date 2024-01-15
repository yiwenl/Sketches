import { GL, Draw, Geom, ShaderLibs } from "alfrid";

import fs from "shaders/bg.frag";

export default class DrawBg extends Draw {
  constructor() {
    super()
      .setMesh(Geom.bigTriangle())
      .useProgram(ShaderLibs.bigTriangleVert, fs);
  }

  draw() {
    GL.disable(GL.DEPTH_TEST);
    this.uniform("uRatio", GL.aspectRatio);
    super.draw();
    GL.enable(GL.DEPTH_TEST);
  }
}
