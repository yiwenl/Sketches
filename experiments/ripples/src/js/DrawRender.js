import { GL, Draw, Mesh } from "alfrid";

import Config from "./Config";

import vs from "shaders/render.vert";
import fs from "shaders/render.frag";

class DrawRender extends Draw {
  constructor() {
    super();

    const { numParticles: num } = Config;
    const positions = [];
    const uvs = [];
    const indices = [];
    let index = 0;

    for (let i = 0; i < num; i++) {
      for (let j = 0; j < num; j++) {
        positions.push([Math.random(), Math.random(), Math.random()]);
        uvs.push([i / num, j / num]);
        indices.push(index++);
      }
    }

    const mesh = new Mesh(GL.POINTS)
      .bufferVertex(positions)
      .bufferTexCoord(uvs)
      .bufferIndex(indices);

    this.setMesh(mesh).useProgram(vs, fs);
  }
}

export default DrawRender;
