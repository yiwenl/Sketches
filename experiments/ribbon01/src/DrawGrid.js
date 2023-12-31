import { Geom, Draw } from "alfrid";

import vs from "shaders/grid.vert";
import fs from "shaders/grid.frag";

export default class DrawGrid extends Draw {
  constructor() {
    super();

    let s = 0.1;
    const mesh = Geom.cube(s, s, s);

    const r = 2;
    const num = 5;
    const posOffsets = [];
    const scales = [];

    s = 0.01;

    for (let k = -num; k <= num; k++) {
      for (let j = -num; j <= num; j++) {
        for (let i = -num; i <= num; i++) {
          posOffsets.push([i * r, j * r, k * r]);
          posOffsets.push([i * r, j * r, k * r]);
          posOffsets.push([i * r, j * r, k * r]);

          scales.push([1, s, s], [s, 1, s], [s, s, 1]);
        }
      }
    }

    mesh
      .bufferInstance(posOffsets, "aPosOffset")
      .bufferInstance(scales, "aScale");

    this.setMesh(mesh).useProgram(vs, fs);
  }
}
