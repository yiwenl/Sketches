import { Geom, ShaderLibs, Draw } from "alfrid";

import fs from "shaders/bg.frag";

export default class DrawBackground extends Draw {
  constructor() {
    super();
    this.setMesh(Geom.bigTriangle()).useProgram(ShaderLibs.bigTriangleVert, fs);
  }
}
