import { GL, Draw, Mesh } from "alfrid";

import Config from "./Config";

import vs from "shaders/drops.vert";
import fs from "shaders/drops.frag";

export default class DrawDrops extends Draw {
  constructor() {
    super();

    const positions = [];
    const indices = [];

    const { numDrops: num } = Config;

    for (let j = 0; j < num; j++) {
      for (let i = 0; i < num; i++) {
        positions.push([(i + 0.5) / num, (j + 0.5) / num, 0]);
        indices.push(i + j * num);
      }
    }

    const mesh = new Mesh(GL.POINTS)
      .bufferVertex(positions)
      .bufferIndex(indices);

    this.setMesh(mesh).useProgram(vs, fs);
  }
}
