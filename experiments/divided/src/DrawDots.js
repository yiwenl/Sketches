import { GL, Draw, Mesh } from "alfrid";
import { random } from "./utils";
import vs from "shaders/dots.vert";
import fs from "shaders/dots.frag";

export default class DrawDots extends Draw {
  constructor(mNum) {
    super();

    const positions = [];
    const uvs = [];
    const indices = [];

    let count = 0;

    for (let j = 0; j < mNum; j++) {
      for (let i = 0; i < mNum; i++) {
        positions.push([random(), random(), random()]);
        uvs.push([i / mNum, j / mNum]);
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
