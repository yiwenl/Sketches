import { Draw, Geom, ShaderLibs } from "alfrid";

import fs from "shaders/adjust.frag";

export default class DrawSim extends Draw {
  constructor() {
    super()
      .setMesh(Geom.bigTriangle())
      .useProgram(ShaderLibs.bigTriangleVert, fs)
      .setClearColor(0, 0, 0, 0);
  }
}
