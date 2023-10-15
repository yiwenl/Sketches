import { Mesh, Draw } from "alfrid";
import { random } from "./utils";
import vs from "shaders/ribbon.vert";
import fs from "shaders/ribbon.frag";

export default class DrawRibbon extends Draw {
  constructor() {
    super();

    const positions = [];
    const uvs = [];
    // const normals = []
    const indices = [];
    let count = 0;

    const numSides = 4;
    const numSeg = 12;
    for (let j = 0; j < numSeg; j++) {
      for (let i = 0; i < numSides; i++) {
        positions.push([i, j, 0]);
        positions.push([i + 1, j, 0]);
        positions.push([i + 1, j + 1, 0]);
        positions.push([i, j + 1, 0]);

        uvs.push([i / numSides, j / numSeg]);
        uvs.push([(i + 1) / numSides, j / numSeg]);
        uvs.push([(i + 1) / numSides, (j + 1) / numSeg]);
        uvs.push([i / numSides, (j + 1) / numSeg]);

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
    let num = 1000;
    const uvOffsets = [];
    const extras = [];
    while (num--) {
      uvOffsets.push([random(), random()]);
      extras.push([random(), random(), random()]);
    }
    mesh.bufferInstance(uvOffsets, "aUVOffset");
    mesh.bufferInstance(extras, "aExtra");

    this.setMesh(mesh).useProgram(vs, fs);
  }
}
