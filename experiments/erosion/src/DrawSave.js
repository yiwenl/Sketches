import { GL, Mesh, Draw } from "alfrid";

import Config from "./Config";
import { random } from "./utils";

import vs from "shaders/save.vert";
import fs from "shaders/save.frag";

export default class DrawSave extends Draw {
  constructor() {
    super();

    const { numDrops: num } = Config;

    const positions = [];
    const normals = [];
    const uvs = [];
    const indices = [];

    for (let j = 0; j < num; j++) {
      for (let i = 0; i < num; i++) {
        positions.push([random(-1, 1), random(-1, 1), random()]);
        uvs.push([((i + 0.5) / num) * 2 - 1, ((j + 0.5) / num) * 2 - 1]);
        normals.push([random(), random(), random()]);
        indices.push(i + j * num);
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
