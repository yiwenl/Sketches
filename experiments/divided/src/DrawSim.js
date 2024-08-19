import { Draw, Geom, ShaderLibs } from "alfrid";

import fs from "./shaders/sim.frag";

export default class DrawSim extends Draw {
  constructor() {
    super()
      .setMesh(Geom.bigTriangle())
      .useProgram(ShaderLibs.bigTriangleVert, fs);
  }
}
