import { Draw, GL, Mesh } from "@alfrid";
import { random } from "@utils";
import Config from "./Config";
import vs from "./shaders/dots.vert";
import fs from "./shaders/dots.frag";

export default class DrawDots extends Draw {
  constructor() {
    super();

    const { numParticles: num } = Config;
    const positions = [];
    const uvs = [];

    const indices = [];

    for (let i = 0; i < num; i++) {
      for (let j = 0; j < num - 1; j++) {
        positions.push([random(), random(), random()]);
        uvs.push([j / num + 0.5 / num, i / num + 0.5 / num]);
        indices.push(i * num + j);
      }
    }

    const mesh = new Mesh(GL.POINTS)
      .bufferVertex(positions)
      .bufferTexCoord(uvs)
      .bufferIndex(indices);

    this.setMesh(mesh).useProgram(vs, fs);
  }
}
