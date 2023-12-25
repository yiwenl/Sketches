import { Draw, Geom } from "alfrid";

import Config from "./Config";
import { random } from "./utils";

import vs from "shaders/blocks.vert";
import fs from "shaders/blocks.frag";

export default class DrawBlocks extends Draw {
  constructor() {
    super();

    const s = 0.03;
    const mesh = Geom.cube(s, s, s);

    // instancing
    const { numParticles: num } = Config;
    const posOffsets = [];
    const extras = [];

    for (let j = 0; j < num; j++) {
      for (let i = 0; i < num; i++) {
        let s = random(1, 2);
        if (random() < 0.005) {
          s = random(8, 5);
          // s = random(8, 10);
        }
        posOffsets.push([i / num, j / num, s * 0.7]);
        extras.push([random(), random(), random()]);
      }
    }

    mesh
      .bufferInstance(posOffsets, "aPosOffset")
      .bufferInstance(extras, "aExtra");

    this.setMesh(mesh).useProgram(vs, fs);
  }
}
