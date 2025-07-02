import { Draw, GL, Mesh } from "alfrid";
import Config from "./Config";
import { random } from "./utils";

import vs from "shaders/particles.vert";
import fs from "shaders/particles.frag";

export default class DrawParticles extends Draw {
  constructor() {
    super();

    const { numParticles: num } = Config;
    const positions = [];
    const uvs = [];
    const indices = [];

    for (let i = 0; i < num; i++) {
      for (let j = 0; j < num; j++) {
        positions.push([random(), random(), random()]);
        uvs.push([i / num, j / num]);
        indices.push(i * num + j);
      }
    }

    const mesh = new Mesh(GL.POINTS)
      .bufferVertex(positions)
      .bufferTexCoord(uvs)
      .bufferIndex(indices);

    this.setMesh(mesh).useProgram(vs, fs);
  }
}
