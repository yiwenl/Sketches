import { Draw, Geom } from "alfrid";
import vs from "shaders/direction.vert";
import fs from "shaders/direction.frag";

export default class DrawDirection extends Draw {
  constructor() {
    super();

    const s = 0.15;
    const mesh = Geom.plane(s, s, 1);
    const num = Math.floor(7 / s);

    const posOffsets = [];
    for (let j = -num; j <= num; j++) {
      for (let i = -num; i <= num; i++) {
        posOffsets.push([i * s, j * s, 0]);
        posOffsets.push([i * s, j * s, 1]);
      }
    }

    mesh.bufferInstance(posOffsets, "aPosOffset");

    this.setMesh(mesh).useProgram(vs, fs);
  }
}
