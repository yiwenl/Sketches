import { Draw, Geom } from "alfrid";

import vs from "shaders/pass.vert";
import fs from "shaders/sim.frag";

export default class DrawSave extends Draw {
  constructor() {
    super()
      .setMesh(Geom.bigTriangle())
      .useProgram(vs, fs)
      .setClearColor(0, 0, 0, 1);
  }
}
