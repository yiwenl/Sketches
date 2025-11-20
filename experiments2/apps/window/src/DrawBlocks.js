import { Draw, GL, Geom } from "@alfrid";
import Config from "./Config";
import { random } from "@utils";

import vs from "./shaders/blocks.vert";
import fs from "./shaders/blocks.frag";

export default class DrawBlocks extends Draw {
  constructor() {
    super();

    const ratio = 0.2;
    const s = 0.2;
    const mesh = Geom.cube(s, s * ratio, s * ratio);

    const { numParticles: num } = Config;
    const uvs = [];
    const extras = [];

    for (let i = 0; i < num; i++) {
      for (let j = 0; j < num; j++) {
        uvs.push([i / num + 0.5 / num, j / num + 0.5 / num]);
        extras.push([random(0.25, 0.8), random(0.25, 1), random()]);
      }
    }

    mesh.bufferInstance(uvs, "aUv").bufferInstance(extras, "aExtra");

    this.setMesh(mesh).useProgram(vs, fs);
  }
}
