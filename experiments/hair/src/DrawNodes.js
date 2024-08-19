import { GL, Mesh, Draw } from "alfrid";

import Config from "./Config";
import { random } from "./utils";

import vs from "shaders/nodes.vert";
import fs from "shaders/nodes.frag";

export default class DrawNodes extends Draw {
  constructor() {
    super();

    const { numHair, numSeg } = Config;

    const positions = [];
    const uvs = [];
    const indices = [];

    for (let j = 0; j < numHair; j++) {
      for (let i = 0; i < numSeg; i++) {
        positions.push([random(), random(), random()]);
        uvs.push([i / numSeg, j / numHair]);
        indices.push(i + j * numHair);
      }
    }

    const mesh = new Mesh(GL.POINTS)
      .bufferVertex(positions)
      .bufferTexCoord(uvs)
      .bufferIndex(indices);

    this.setMesh(mesh).useProgram(vs, fs);
  }
}
