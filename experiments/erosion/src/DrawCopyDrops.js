import { Draw, Geom, ShaderLibs } from "alfrid";

import fs from "shaders/copyDrops.frag";

export default class DrawCopyDrops extends Draw {
  constructor() {
    super()
      .setMesh(Geom.bigTriangle())
      .useProgram(ShaderLibs.bigTriangleVert, fs)
      .setClearColor(0, 0, 0, 0);
  }
}
