import { Geom, ShaderLibs, Draw } from "alfrid";

import vs from "shaders/basic.vert";
import fs from "shaders/fluid-bg.frag";

export default class DrawDither extends Draw {
  constructor(r) {
    super()
      .setMesh(Geom.plane(r * 2, r * 2, 1))
      .useProgram(vs, fs);
  }
}
