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
    const colors = [];
    const data = [];
    const indices = [];

    let count = 0;

    const numSides = 3;
    const r = 0.002;
    const addVertex = (j, point, p, normal, index) => {
      const v = [r, 0, 0];
      const n = [1, 0, 0];
      const angle = -(j * Math.PI * 2) / numSides;
      vec3.rotateZ(v, v, [0, 0, 0], angle);
      vec3.rotateZ(n, n, [0, 0, 0], angle);

      vec3.add(v, v, point);

      positions.push(v);
      uvs.push([p, j / numSides]);
      normals.push(n);
      colors.push(normal);
      data.push([index, Math.random()]);
    };

    const minSegmentLength = 0.1;
    mLines.forEach((line) => {
      line.forEach(({ point, normal, index }, i) => {
        if (i < line.length - 1) {
          const nextPoint = line[i + 1].point;
          const nextNormal = line[i + 1].normal;
          const nextIndex = line[i + 1].index;
          const _index = (index + nextIndex) / 2;
          // const _index = index;
          const avgNormal = vec3.add([0, 0, 0], normal, nextNormal);
          vec3.normalize(avgNormal, avgNormal);

          let dist = vec3.distance(point, nextPoint);
          if (dist < minSegmentLength) {
            for (let j = 0; j < numSides; j++) {
              addVertex(j, point, i / line.length, avgNormal, index);
              addVertex(j, nextPoint, (i + 1) / line.length, avgNormal, _index);
              addVertex(
                j + 1,
                nextPoint,
                (i + 1) / line.length,
                avgNormal,
                _index
              );
              addVertex(j + 1, point, i / line.length, avgNormal, _index);

              indices.push(count * 4 + 0);
              indices.push(count * 4 + 1);
              indices.push(count * 4 + 2);
              indices.push(count * 4 + 0);
              indices.push(count * 4 + 2);
              indices.push(count * 4 + 3);

              count++;
            }
          }
        }
      });
    });

    const mesh = new Mesh()
      .bufferVertex(positions)
      .bufferTexCoord(uvs)
      .bufferNormal(normals)
      .bufferData(colors, "aColor")
      .bufferData(data, "aIndex")
      .bufferIndex(indices);

    this.setMesh(mesh).useProgram(vs, fs);
  }
}
