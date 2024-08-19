import { Draw, ShaderLibs, Geom } from "alfrid";
import fs from "shaders/chroma.frag";

export default class DrawChroma extends Draw {
  constructor() {
    super()
      .setMesh(Geom.bigTriangle())
      .useProgram(ShaderLibs.bigTriangleVert, fs);
  }
}
