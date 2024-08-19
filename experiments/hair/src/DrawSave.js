import { Draw, GL, Mesh } from "alfrid";

import Config from "./Config";
import { random } from "./utils";

import vs from "shaders/save.vert";
import fs from "shaders/save.frag";

export default class DrawSave extends Draw {
  constructor() {
    super();

    const { numHair, numSeg } = Config;
    const positions = [];
    const normals = [];
    const coords = [];
    const indices = [];

    for (let j = 0; j < numHair; j++) {
      for (let i = 0; i < numSeg; i++) {
        positions.push([i, j + random(-1, 1) * 0.1, 0]);
        // positions.push([random(), random(), random()]);
        coords.push([(i / numSeg) * 2 - 1, (j / numHair) * 2 - 1]);
        normals.push([random(), random(), random()]);
        indices.push(i + j * numHair);
      }
    }

    const mesh = new Mesh(GL.POINTS)
      .bufferVertex(positions)
      .bufferTexCoord(coords)
      .bufferNormal(normals)
      .bufferIndex(indices);

    this.setMesh(mesh).useProgram(vs, fs);
  }
}
