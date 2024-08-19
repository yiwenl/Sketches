import { Draw, Geom } from "alfrid";
import { random } from "./utils";

import vs from "shaders/blocks.vert";
import fs from "shaders/blocks.frag";

export default class DrawBlocks extends Draw {
  constructor(mNum) {
    super();

    const s = 0.05;
    const ratio = 0.3;
    const mesh = Geom.cube(s, s * ratio, s * ratio);

    // instancing
    const posOffsets = [];
    const randoms = [];
    for (let j = 0; j < mNum; j++) {
      for (let i = 0; i < mNum; i++) {
        posOffsets.push([i / mNum, j / mNum, random()]);
        randoms.push([random(1, 0.5), random(0.2, 2), random()]);
      }
    }

    mesh
      .bufferInstance(posOffsets, "aPosOffset")
      .bufferInstance(randoms, "aRandom");

    this.setMesh(mesh).useProgram(vs, fs);
  }
}
