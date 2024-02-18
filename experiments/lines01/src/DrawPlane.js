import { Draw, Geom } from "alfrid";
import { randomInt } from "./utils";

import vs from "shaders/planes.vert";
import fs from "shaders/planes.frag";

export default class DrawPlane extends Draw {
  constructor(num) {
    super();

    const s = 0.2;
    const ratio = 0.2;
    // const mesh = Geom.plane(s, s * ratio, 1);
    const mesh = Geom.cube(s, s * ratio, s * ratio);

    const uvsOffsets = [];
    const posOffsets = [];

    for (let i = 0; i < num; i++) {
      for (let j = 0; j < num; j++) {
        posOffsets.push([
          Math.random(),
          0.5 * randomInt(2),
          0.5 * randomInt(2),
        ]);
        uvsOffsets.push([i / num, j / num]);
      }
    }

    mesh
      .bufferInstance(posOffsets, "aPosOffset")
      .bufferInstance(uvsOffsets, "aUVOffset");

    this.setMesh(mesh).useProgram(vs, fs);
  }
}
