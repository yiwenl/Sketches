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
        positions.push([random(), random(), random(0)]);
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
