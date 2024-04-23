import { Draw, Geom } from "alfrid";
import { random } from "./utils";
import Config from "./Config";

import vs from "shaders/blocks.vert";
import fs from "shaders/blocks.frag";

export default class DrawBlocks extends Draw {
  constructor() {
    super();

    const s = 0.15;
    const ratio = 0.4;
    const mesh = Geom.cube(s, s * ratio, s * ratio);

    const { numParticles } = Config;

    const num = Math.floor(numParticles * 0.15);

    const uvs = [];
    const extras = [];

    for (let i = 0; i < num; i++) {
      for (let j = 0; j < num; j++) {
        uvs.push([i / num, j / num]);
        extras.push([random(), random(), random()]);
      }
    }

    mesh.bufferInstance(uvs, "aUV").bufferInstance(extras, "aExtra");

    this.setMesh(mesh).useProgram(vs, fs);
  }
}
