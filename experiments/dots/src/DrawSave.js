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
    const indices = [];

    const r = 6;
    const { sin, cos, PI, sqrt } = Math;

    const getPos = () => {
      const a = random(PI * 2);
      const _r = sqrt(random()) * r;
      return [cos(a) * _r, sin(a) * _r, 0];
    };

    let count = 0;
    for (let j = 0; j < num; j++) {
      for (let i = 0; i < num; i++) {
        positions.push(getPos());
        uvs.push([
          (i / num) * 2 - 1 + 0.5 / num,
          (j / num) * 2 - 1 + 0.5 / num,
        ]);
        normals.push([random(), random(), random()]);
        datas.push([random(), random(), random()]);
        indices.push(count);
      }
    }

    const mesh = new Mesh(GL.POINTS)
      .bufferVertex(positions)
      .bufferTexCoord(uvs)
      .bufferNormal(normals)
      .bufferData(datas, "aData", 3)
      .bufferIndex(indices);

    this.setMesh(mesh).useProgram(vs, fs).setClearColor(0, 0, 0, 1);
  }
}
