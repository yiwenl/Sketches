import { Draw, Geom, ShaderLibs } from "alfrid";

import fs from "shaders/sim.frag";
import fs2 from "shaders/sim2.frag";

export default class DrawSim extends Draw {
  constructor() {
    super()
      .setMesh(Geom.bigTriangle())
      .useProgram(ShaderLibs.bigTriangleVert, fs2)
      .setClearColor(0, 0, 0, 0);
  }
}
