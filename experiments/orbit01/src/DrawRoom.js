import { GL, Draw, Geom } from "alfrid";

import vs from "shaders/room.vert";
import fs from "shaders/room.frag";

export default class DrawRoom extends Draw {
  constructor() {
    super();

    const r = 20;
    const mesh = Geom.cube(r, r, r);

    this.setMesh(mesh).useProgram(vs, fs);
  }

  draw() {
    GL.cullFace(GL.FRONT);
    super.draw();
    GL.cullFace(GL.BACK);
  }
}
