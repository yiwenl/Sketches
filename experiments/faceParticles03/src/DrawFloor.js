import { Draw, Geom } from "alfrid";

import vs from "shaders/floor.vert";
import fs from "shaders/floor.frag";

export default class DrawFloor extends Draw {
  constructor() {
    const s = 15;
    super().setMesh(Geom.plane(s, s, 1, "xz")).useProgram(vs, fs);
  }
}
