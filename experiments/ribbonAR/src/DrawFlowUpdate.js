import { Draw, Geom, ShaderLibs } from "alfrid";
import fs from "shaders/flowUpdate.frag";

export default class DrawFlowUpdate extends Draw {
  constructor() {
    super()
      .setMesh(Geom.bigTriangle())
      .useProgram(ShaderLibs.bigTriangleVert, fs)
      .setClearColor(0, 0, 0, 1);
  }
}
