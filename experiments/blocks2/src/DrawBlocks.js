import { Draw, Geom } from "alfrid";

import Config from "./Config";
import { random } from "./utils";

import vs from "shaders/blocks.vert";
import fs from "shaders/blocks.frag";

export default class DrawBlocks extends Draw {
  constructor() {
    super();

    const s = 0.05;
    const mesh = Geom.cube(s, s, s);

    // instancing
    const { numParticles: num } = Config;
    const posOffsets = [];
    const extras = [];

    for (let j = 0; j < num; j++) {
      for (let i = 0; i < num; i++) {
        posOffsets.push([i / num, j / num, random(1, 3)]);
        extras.push([random(), random(), random()]);
      }
    }

    mesh
      .bufferInstance(posOffsets, "aPosOffset")
      .bufferInstance(extras, "aExtra");

    this.setMesh(mesh).useProgram(vs, fs);
  }
}
