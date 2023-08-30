import { GL, Draw, Mesh } from "alfrid";
import { random } from "./utils";
import Config from "./Config";

import vs from "shaders/save.vert";
import fs from "shaders/save.frag";

class DrawSave extends Draw {
  constructor() {
    super();

    const { numParticles, planeSize: r } = Config;
    const positions = [];
    const uvs = [];
    const extras = [];
    const data = [];
    const indices = [];
    let count = 0;

    for (let j = 0; j < numParticles; j++) {
      for (let i = 0; i < numParticles; i++) {
        positions.push([random(-r, r), random(-r, r), 0]);
        uvs.push([(i / numParticles) * 2 - 1, (j / numParticles) * 2 - 1]);
        extras.push([random(), random(), random()]);
        data.push([random(), random(), random()]);
        indices.push(count);
        count++;
      }
    }

    const mesh = new Mesh(GL.POINTS)
      .bufferVertex(positions)
      .bufferTexCoord(uvs)
      .bufferNormal(extras)
      .bufferData(data, "aData")
      .bufferIndex(indices);

    this.setMesh(mesh).useProgram(vs, fs);
  }
}

export default DrawSave;
