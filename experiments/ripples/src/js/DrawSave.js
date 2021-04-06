import { GL, Draw, Mesh } from "alfrid";

import Config from "./Config";
import { random } from "randomutils";
import vs from "shaders/save.vert";
import fs from "shaders/save.frag";

class DrawSave extends Draw {
  constructor() {
    super();

    const { numParticles: num, paintingSize } = Config;

    const positions = [];
    const uvs = [];
    const normals = [];
    const datas = [];
    const indices = [];

    const getPos = () => {
      let r = Math.sqrt(Math.random());
      r = r * 0.05 + 0.5;

      const a = Math.random() * Math.PI * 2.0;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      const y = 0.02;

      return [x, random(-y, y), z];
    };

    let index = 0;
    for (let i = 0; i < num; i++) {
      for (let j = 0; j < num; j++) {
        positions.push(getPos());
        uvs.push([(i / num) * 2 - 1, (j / num) * 2 - 1]);
        normals.push([random(1), random(1), random(1)]);
        datas.push([random(1), random(1), random(1)]);

        indices.push(index++);
      }
    }

    const mesh = new Mesh(GL.POINTS)
      .bufferVertex(positions)
      .bufferTexCoord(uvs)
      .bufferNormal(normals)
      .bufferData(datas, "aData", 3)
      .bufferIndex(indices);

    this.setMesh(mesh).useProgram(vs, fs);
  }
}

export default DrawSave;
