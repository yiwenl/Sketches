import { GL, Draw, Geom } from "alfrid";

import Config from "./Config";
import { random } from "./utils";

import vs from "shaders/blocks.vert";
import fs from "shaders/blocks.frag";

export default class DrawBlocks extends Draw {
  constructor() {
    super();

    const s = GL.isMobile ? 0.1 : 0.05;
    const mesh = Geom.cube(s, s, s);

    // instancing
    const { numParticles: num } = Config;
    const posOffsets = [];
    const extras = [];

    let massiveSet = false;

    for (let j = 0; j < num; j++) {
      for (let i = 0; i < num; i++) {
        let scale = random(1, 3);
        if (random() < 0.00025) {
          scale = random(10, 8);
        }
        posOffsets.push([i / num, j / num, scale]);
        extras.push([random(), random(), random()]);
      }
    }

    mesh
      .bufferInstance(posOffsets, "aPosOffset")
      .bufferInstance(extras, "aExtra");

    this.setMesh(mesh).useProgram(vs, fs);
  }
}
