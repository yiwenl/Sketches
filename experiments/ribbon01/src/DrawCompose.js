import { Draw, Geom, ShaderLibs } from "alfrid";

import fs from "shaders/compose.frag";

export default class DrawCompose extends Draw {
  constructor() {
    super()
      .setMesh(Geom.bigTriangle())
      .useProgram(ShaderLibs.bigTriangleVert, fs);
  }
}
