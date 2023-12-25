import { Draw, Geom, ShaderLibs } from "alfrid";

import fs from "shaders/reflection.frag";

export default class DrawReflection extends Draw {
  constructor() {
    super()
      .setMesh(Geom.bigTriangle())
      .useProgram(ShaderLibs.bigTriangleVert, fs);
  }
}
