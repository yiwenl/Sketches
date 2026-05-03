import { Draw, Geom, ShaderLibs } from "@alfrid";
import { random } from "@utils";
import fs from "./shaders/add-base-noise.frag";

export default class DrawAddBaseNoise extends Draw {
  constructor() {
    super();

    this.setMesh(Geom.bigTriangle())
      .useProgram(ShaderLibs.bigTriangleVert, fs)
      .setClearColor(0, 0, 0, 0)
      .uniform("uSeed", random(1000));
  }
}
