import { Draw, ShaderLibs, Geom } from "alfrid";
import Config from "./Config";
import fs from "shaders/sim.frag";

export default class DrawSim extends Draw {
  constructor() {
    super();

    const _fs = fs.replace("${NUM_STARS}", Config.numStars);

    this.setMesh(Geom.bigTriangle())
      .useProgram(ShaderLibs.bigTriangleVert, _fs)
      .setClearColor(0, 0, 0, 1);
  }
}
