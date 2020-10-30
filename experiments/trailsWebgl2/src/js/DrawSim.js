import alfrid, { GL } from "alfrid";

import vs from "shaders/pass.vert";
import fs from "shaders/sim.frag";

class DrawSim extends alfrid.Draw {
  constructor() {
    super();

    this.setMesh(alfrid.Geom.bigTriangle())
      .useProgram(vs, fs)
      .setClearColor(0, 0, 0, 0);
  }
}

export default DrawSim;
