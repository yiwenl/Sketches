import { GL, Draw, Mesh } from "alfrid";

import Config from "./Config";
import { random } from "./utils";

import vs from "shaders/render.vert";
import fs from "shaders/render.frag";

class DrawRender extends Draw {
  constructor() {
    super();

    const { numParticles, planeSize: r } = Config;

    const positions = [];
    const uvs = [];
    const indices = [];
    let count = 0;

    for (let j = 0; j < numParticles; j++) {
      for (let i = 0; i < numParticles; i++) {
        positions.push([random(), random(), random()]);
        uvs.push([i / numParticles, j / numParticles]);
        indices.push(count);
        count++;
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
