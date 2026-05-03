import { Draw, Geom, ShaderLibs } from "@alfrid";
// import Constants from "./Constants";
// import Config from "./Config";
import fs from "./shaders/sim.frag";

export default class DrawSim extends Draw {
  constructor() {
    super();

    this.setMesh(Geom.bigTriangle())
      .useProgram(ShaderLibs.bigTriangleVert, fs)
      .setClearColor(0, 0, 0, 1);
  }
}
