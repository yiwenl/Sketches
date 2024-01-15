import { Draw, ShaderLibs, Geom } from "alfrid";

import fs from "shaders/scramble.frag";

export default class DrawScramble extends Draw {
  constructor() {
    super()
      .setMesh(Geom.bigTriangle())
      .useProgram(ShaderLibs.bigTriangleVert, fs)
      .setClearColor(0, 0, 0, 0);
  }
}
