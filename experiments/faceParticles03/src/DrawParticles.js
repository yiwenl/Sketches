import { Mesh, GL, Draw } from "alfrid";

import { random } from "./utils";
import Config from "./Config";

import vs from "shaders/particle.vert";
import fs from "shaders/particle.frag";

export default class DrawParticles extends Draw {
  constructor() {
    super();

    const { numParticles: num } = Config;
    const positions = [];
    const uvs = [];
    const indices = [];

    for (let j = 0; j < num; j++) {
      for (let i = 0; i < num; i++) {
        let scale = random(0.5, 1.5);
        if (random() < 0.03) {
          scale *= random(2, 3);
        }
        positions.push([random(), random(), scale]);
        uvs.push([i / num, j / num]);
        indices.push(i + j * num);
      }
    }

    const mesh = new Mesh(GL.POINTS)
      .bufferVertex(positions)
      .bufferTexCoord(uvs)
      .bufferIndex(indices);

    this.setMesh(mesh).useProgram(vs, fs);
  }
}
