import alfrid, { GL } from "alfrid";
import fs from "shaders/sim.frag";

class DrawSim extends alfrid.Draw {
  constructor() {
    super();

    this.setMesh(alfrid.Geom.bigTriangle())
      .useProgram(alfrid.ShaderLibs.bigTriangleVert, fs)
      .setClearColor(0, 0, 0, 0);
  }
}

export default DrawSim;
