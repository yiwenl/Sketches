import { Draw, Mesh } from "alfrid";

import Config from "./Config";
import { random } from "./utils";
import vs from "shaders/belt.vert";
import fs from "shaders/belt.frag";

export default class DrawBelt extends Draw {
  constructor() {
    super();

    const numSeg = 12;
    const sides = 4;
    const positions = [];
    const uvs = [];
    const indices = [];
    let count = 0;
    for (let i = 0; i < numSeg; i++) {
      for (let j = 0; j < sides; j++) {
        positions.push([i, j, 0]);
        positions.push([i + 1, j, 0]);
        positions.push([i + 1, j + 1, 0]);
        positions.push([i, j + 1, 0]);

        uvs.push([i / numSeg, j / sides]);
        uvs.push([(i + 1) / numSeg, j / sides]);
        uvs.push([(i + 1) / numSeg, (j + 1) / sides]);
        uvs.push([i / numSeg, (j + 1) / sides]);

        indices.push(count * 4 + 0);
        indices.push(count * 4 + 1);
        indices.push(count * 4 + 2);
        indices.push(count * 4 + 0);
        indices.push(count * 4 + 2);
        indices.push(count * 4 + 3);
        count++;
      }
    }

    const mesh = new Mesh()
      .bufferVertex(positions)
      .bufferTexCoord(uvs)
      .bufferIndex(indices);

    // instancing
    const { numParticles: num } = Config;
    const uvOffset = [];
    const extra = [];
    for (let i = 0; i < num; i++) {
      for (let j = 0; j < num; j++) {
        uvOffset.push([i / num, j / num]);
        extra.push([random(), random(), random()]);
      }
    }
    mesh.bufferInstance(uvOffset, "aUVOffset").bufferInstance(extra, "aExtra");

    this.setMesh(mesh).useProgram(vs, fs);
  }
}
