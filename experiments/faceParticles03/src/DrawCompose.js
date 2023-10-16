import { Draw, Geom } from "alfrid";

import vs from "shaders/pass.vert";
import fs from "shaders/compose.frag";

export default class DrawCompose extends Draw {
  constructor() {
    super().setMesh(Geom.bigTriangle()).useProgram(vs, fs);
  }
}
