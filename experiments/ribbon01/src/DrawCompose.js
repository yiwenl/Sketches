import { Draw, Geom, ShaderLibs } from "alfrid";

// import fs from "shaders/compose.frag";
import fs from "shaders/dof.frag";

export default class DrawCompose extends Draw {
  constructor() {
    super()
      .setMesh(Geom.bigTriangle())
      .useProgram(ShaderLibs.bigTriangleVert, fs);
  }
}
