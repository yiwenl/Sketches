import { GL, Draw, Mesh } from "alfrid";

import Config from "./Config";
import { random } from "./utils";

import vs from "shaders/render.vert";
import fs from "shaders/render.frag";

export default class DrawRender extends Draw {
  constructor() {
    super();

    const positions = [];
    const uvs = [];
    const indices = [];

    const { numParticles: num } = Config;
    for (let j = 0; j < num; j++) {
      for (let i = 0; i < num; i++) {
        positions.push([random(), random(), random()]);
        uvs.push([i / num, j / num]);
        indices.push(j * num + i);
      }
    }

    const mesh = new Mesh(GL.POINTS)
      .bufferVertex(positions)
      .bufferTexCoord(uvs)
      .bufferIndex(indices);

    this.setMesh(mesh).useProgram(vs, fs);
  }
}
