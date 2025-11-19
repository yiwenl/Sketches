import { Draw, GL, Mesh } from "@alfrid";
import Config from "./Config";
import { random } from "@utils";

import vs from "./shaders/save.vert";
import fs from "./shaders/save.frag";

export default class DrawSave extends Draw {
  constructor() {
    super();

    const { numParticles: num } = Config;
    const positions = [];
    const uvs = [];
    const extra = [];
    const indices = [];

    const getPos = () => {
      const ratio = 1 / 2.5;
      const w = 10;
      const h = w * ratio;
      const d = 2;
      const x = random(-w / 2, w / 2);
      const y = random(-h / 2, h / 2);
      const z = random(-d / 2, d / 2);
      return [x, y, z];
    };

    for (let i = 0; i < num; i++) {
      for (let j = 0; j < num; j++) {
        const index = i * num + j;
        positions.push(getPos());
        uvs.push([(i / num) * 2 - 1 + 1 / num, (j / num) * 2 - 1 + 1 / num]);
        extra.push([random(), random(), random()]);
        indices.push(index);
      }
    }

    const mesh = new Mesh(GL.POINTS)
      .bufferVertex(positions)
      .bufferTexCoord(uvs)
      .bufferNormal(extra)
      .bufferIndex(indices);

    this.setMesh(mesh).useProgram(vs, fs);
  }
}
