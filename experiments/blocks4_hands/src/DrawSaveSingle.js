import { GL, Draw, Mesh } from "alfrid";

import Config from "./Config";
import { random } from "./utils";
import { vec3 } from "gl-matrix";
import vs from "shaders/saveSingle.vert";
import fs from "shaders/saveSingle.frag";

export default class DrawSaveSingle extends Draw {
  constructor() {
    super();

    const { numParticles: num } = Config;

    const positions = [];
    const uvs = [];
    const indices = [];
    let count = 0;

    const getPos = () => {
      const p = vec3.create();
      const r = Math.pow(Math.sqrt(random()), 2) * 0.2;
      vec3.random(p, r);
      return p;
    };

    for (let j = 0; j < num; j++) {
      for (let i = 0; i < num; i++) {
        positions.push(getPos());
        uvs.push([
          (i / num) * 2 - 1 + 0.5 / num,
          (j / num) * 2 - 1 + 0.5 / num,
        ]);

        count++;
        indices.push(count);
      }
    }

    const mesh = new Mesh(GL.POINTS)
      .bufferVertex(positions)
      .bufferTexCoord(uvs)
      .bufferIndex(indices);

    this.setMesh(mesh).useProgram(vs, fs);
  }
}
