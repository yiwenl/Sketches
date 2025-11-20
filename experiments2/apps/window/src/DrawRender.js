import { Draw, GL, Mesh } from "@alfrid";
import Config from "./Config";
import { random } from "@utils";

import vs from "./shaders/render.vert";
import fs from "./shaders/render.frag";

export default class DrawRender extends Draw {
  constructor() {
    super();
    const { numParticles: num } = Config;

    const positions = [];
    const uvs = [];
    const indices = [];

    for (let i = 0; i < num; i++) {
      for (let j = 0; j < num; j++) {
        const index = i * num + j;
        positions.push([random(), random(), random()]);
        uvs.push([i / num + 0.5 / num, j / num + 0.5 / num]);
        indices.push(index);
      }
    }

    const mesh = new Mesh(GL.POINTS)
      .bufferVertex(positions)
      .bufferTexCoord(uvs)
      .bufferIndex(indices);

    this.setMesh(mesh).useProgram(vs, fs);
  }
}
