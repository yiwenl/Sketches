import { GL, Draw, Mesh } from "alfrid";
import Config from "./Config";
import { random } from "./utils";

import vs from "shaders/save.vert";
import fs from "shaders/save.frag";

export default class DrawSave extends Draw {
  constructor() {
    super();

    const positions = [];
    const normals = [];
    const uvs = [];
    const indices = [];

    const getPos = () => {
      const r = 2;
      return [random(-r, r), random(-r, r), random(-r, r)];
    };

    const { numParticles: num } = Config;
    for (let i = 0; i < num; i++) {
      for (let j = 0; j < num; j++) {
        positions.push(getPos());
        uvs.push([
          (i / num) * 2 - 1 + 0.5 / num,
          (j / num) * 2 - 1 + 0.5 / num,
        ]);
        normals.push([random(), random(), random()]);
        indices.push(i * num + j);
      }
    }

    const mesh = new Mesh(GL.POINTS)
      .bufferVertex(positions)
      .bufferTexCoord(uvs)
      .bufferNormal(normals)
      .bufferIndex(indices);

    this.setMesh(mesh).useProgram(vs, fs);
  }
}
