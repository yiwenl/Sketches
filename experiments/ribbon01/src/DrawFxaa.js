import { Draw, Geom, ShaderLibs } from "alfrid";

import fs from "shaders/fxaa.frag";

export default class DrawFxaa extends Draw {
  constructor() {
    super()
      .setMesh(Geom.bigTriangle())
      .useProgram(ShaderLibs.bigTriangleVert, fs);
  }
}
