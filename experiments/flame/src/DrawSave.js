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

    const r = 4;
    const ratio = 4;

    const getPos = () => {
      const x = random(-r, r);
      const y = random(-r / ratio, r / ratio) - 2;
      const z = random(-1, 1) * 0.1;

      return GL.isMobile ? [y, x, z] : [x, y, z];
    };

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
        count++;
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
