import { GL, Draw, Mesh } from "alfrid";
import Config from "./Config";
import { random } from "./utils";
import vs from "shaders/save.vert";
import fs from "shaders/save.frag";

export default class DrawSave extends Draw {
  constructor() {
    super();

    const { numParticles: num } = Config;

    const positions = [];
    const uvs = [];
    const normals = [];
    const datas = [];
    let count = 0;
    const indices = [];

    const { sin, cos, PI, pow } = Math;

    const r = 3;
    const getPos = () => {
      const x = random(-r, r);
      const y = random(-r, r);
      const z = 0;

      return [x, y, z];
    };

    const getNormal = () => {
      const r = pow(random(), 2.0) * 0.5;

      const a = random(PI * 2);
      const x = cos(a) * r + 0.5;
      const y = sin(a) * r + 0.5;

      return [x, y, random()];
    };

    for (let j = 0; j < num; j++) {
      for (let i = 0; i < num; i++) {
        positions.push(getPos());
        uvs.push([
          (i / num) * 2 - 1 + 0.5 / num,
          (j / num) * 2 - 1 + 0.5 / num,
        ]);
        normals.push([random(), random(), random()]);
        // normals.push(getNormal());
        datas.push([0, 0, random()]);
        indices.push(count);
        count++;
      }
    }

    const mesh = new Mesh(GL.POINTS)
      .bufferVertex(positions)
      .bufferTexCoord(uvs)
      .bufferNormal(normals)
      .bufferData(datas, "aData", 3)
      .bufferIndex(indices);

    this.setMesh(mesh).useProgram(vs, fs).setClearColor(0, 0, 0, 0);
  }
}
