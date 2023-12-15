import { Draw, Geom } from "alfrid";
import { random } from "./utils";

import vs from "shaders/char.vert";
import fs from "shaders/char.frag";

export default class DrawChar extends Draw {
  constructor(mScale = 1) {
    super();

    const s = 0.15 * mScale;

    const num = Math.floor(8 / s);

    const mesh = Geom.plane(s, s, 1);

    const posOffsets = [];
    const extras = [];

    for (let j = -num; j <= num; j++) {
      for (let i = -num; i <= num; i++) {
        posOffsets.push([i * s, j * s, 0]);
        extras.push([random(), random(), random()]);
      }
    }

    mesh
      .bufferInstance(posOffsets, "aPosOffset")
      .bufferInstance(extras, "aExtra");

    const invertThreshold = random(0.2, 0.3);

    this.setMesh(mesh)
      .useProgram(vs, fs)
      .uniform("uThresholdInvert", invertThreshold);
  }
}
