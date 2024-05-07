import { Draw, Geom } from "alfrid";

import vs from "shaders/bg.vert";
import fs from "shaders/bg.frag";

export default class DrawBg extends Draw {
  constructor() {
    super();

    const s = 30;
    const mesh = Geom.plane(s, s, 1);
    this.setMesh(mesh).useProgram(vs, fs);
  }
}
