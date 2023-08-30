import { GL, Draw, Mesh } from "alfrid";
import Config from "./Config";
import { random } from "./utils";
import { vec3 } from "gl-matrix";
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

    const r = 4;
    const ratio = 16 / 9;

    // const getPos = () => {
    //   const _r = random(r * 0.8, r);
    //   const p = [_r, 0, 0];
    //   vec3.rotateZ(p, p, [0, 0, 0], Math.random() * Math.PI * 2);
    //   return p;
    // };

    const getPos = () => {
      return [random(-r, r), random(-r, r), random(-1, 1) * 0.2];
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
        indices.push(i);
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
