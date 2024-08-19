import { Draw, Geom, ShaderLibs } from "alfrid";

import fs from "./shaders/cover.frag";

export default class DrawCover extends Draw {
  constructor() {
    super()
      .setMesh(Geom.bigTriangle())
      .useProgram(ShaderLibs.bigTriangleVert, fs);
  }
}
