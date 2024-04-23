import { Geom, ShaderLibs, Draw } from "alfrid";

import fs from "shaders/dither.frag";

export default class DrawDither extends Draw {
  constructor() {
    super()
      .setMesh(Geom.bigTriangle())
      .useProgram(ShaderLibs.bigTriangleVert, fs);
  }
}
