import { Draw, Geom } from "alfrid";

import vs from "shaders/shadow.vert";
import fs from "shaders/shadow.frag";

export default class DrawShadow extends Draw {
  constructor() {
    const s = 12;
    super()
      .setMesh(Geom.plane(s, s * 1.2, 1))
      .useProgram(vs, fs);
  }
}
