import { Draw, Geom, ShaderLibs } from "alfrid";

import fs from "shaders/bg.frag";

export default class DrawBg extends Draw {
  constructor() {
    super()
      .setMesh(Geom.bigTriangle())
      .useProgram(ShaderLibs.bigTriangleVert, fs);
  }
}
