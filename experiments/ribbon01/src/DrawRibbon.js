import { Draw, Mesh } from "alfrid";
import Config from "./Config";
import { random } from "./utils";

import vs from "shaders/ribbon.vert";
import fs from "shaders/ribbon.frag";

export default class DrawRibbon extends Draw {
  constructor() {
    super();
    const { numParticles: num, numSets: numSetsStr } = Config;
    const numSets = parseInt(numSetsStr);

    const positions = [];
    const uvs = [];
    const normals = [];
    const indices = [];

    let count = 0;

    const numSides = 3;

    const getPos = (i, j) => {
      const a = ((Math.PI * 2) / numSides) * j;
      const z = Math.cos(a);
      const y = Math.sin(a);
      const r = 0.01;

      const pos = [i, y * r, z * r];
      const normal = [0, y, z];

      return {
        pos,
        normal,
      };
    };

    const addVertex = (i, j) => {
      const { pos, normal } = getPos(i, j);
      positions.push(pos);
      normals.push(normal);
      uvs.push([i / numSets, j / numSides]);
    };

    const totalSets = numSets * numSets;

    for (let i = 0; i < totalSets - 1; i++) {
      for (let j = 0; j < numSides; j++) {
        addVertex(i, j);
        addVertex(i + 1, j);
        addVertex(i + 1, j + 1);
        addVertex(i, j + 1);

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
      .bufferNormal(normals)
      .bufferIndex(indices);

    // instancing
    const uvOffsets = [];
    const extras = [];

    for (let i = 0; i < num; i++) {
      for (let j = 0; j < num; j++) {
        uvOffsets.push([(i + 0.5) / num / numSets, (j + 0.5) / num / numSets]);
        extras.push([random(), random(), random()]);
      }
    }

    mesh
      .bufferInstance(uvOffsets, "aUVOffset")
      .bufferInstance(extras, "aExtra");

    this.setMesh(mesh)
      .useProgram(vs, fs)
      .uniform("uTotal", totalSets)
      .uniform("uNumSets", numSets);
  }
}
