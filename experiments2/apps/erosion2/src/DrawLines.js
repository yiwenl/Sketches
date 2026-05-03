import { Draw, Mesh } from "@alfrid";
import { vec3 } from "gl-matrix";

import vs from "./shaders/lines.vert";
import fs from "./shaders/lines.frag";

export default class DrawLines extends Draw {
  constructor(mLines) {
    super();

    const positions = [];
    const uvs = [];
    const normals = [];
    const indices = [];
    let count = 0;

    const numSides = 3;
    const r = 0.005;
    const addVertex = (j, point, p) => {
      const v = [r, 0, 0];
      const n = [1, 0, 0];
      const angle = -(j * Math.PI * 2) / numSides;
      vec3.rotateZ(v, v, [0, 0, 0], angle);
      vec3.rotateZ(n, n, [0, 0, 0], angle);

      vec3.add(v, v, point);
      vec3.add(v, v, [0, 1.5, 0]);

      positions.push(v);
      uvs.push([p, j / numSides]);
      normals.push(n);
    };

    mLines.forEach((line) => {
      console.log(line.length);
      line.forEach((point, i) => {
        if (i < line.length - 1) {
          const nextPoint = line[i + 1];

          for (let j = 0; j < numSides; j++) {
            addVertex(j, point, i / line.length);
            addVertex(j, nextPoint, (i + 1) / line.length);
            addVertex(j + 1, nextPoint, (i + 1) / line.length);
            addVertex(j + 1, point, i / line.length);

            indices.push(count * 4 + 0);
            indices.push(count * 4 + 1);
            indices.push(count * 4 + 2);
            indices.push(count * 4 + 0);
            indices.push(count * 4 + 2);
            indices.push(count * 4 + 3);

            count++;
          }
        }
      });
    });

    const mesh = new Mesh()
      .bufferVertex(positions)
      .bufferTexCoord(uvs)
      .bufferNormal(normals)
      .bufferIndex(indices);

    this.setMesh(mesh).useProgram(vs, fs);
  }
}
