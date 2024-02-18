import { Draw, Mesh, GL } from "alfrid";
import { random } from "./utils";
import vs from "shaders/render.vert";
import fs from "shaders/render.frag";

export default class DrawRender extends Draw {
  constructor(num) {
    super();

    const positions = [];
    const uvs = [];
    const indices = [];
    for (let i = 0; i < num; i++) {
      for (let j = 0; j < num; j++) {
        positions.push([random(0.5, 2), random(), random(0.4, 0.6)]);
        uvs.push([i / num, j / num]);
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
