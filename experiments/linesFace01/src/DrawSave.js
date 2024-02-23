import { GL, Draw, Mesh } from "alfrid";
import { random } from "./utils";
import Assets from "./Assets";
import vs from "shaders/save.vert";
import fs from "shaders/save.frag";

export default class DrawSave extends Draw {
  constructor(num) {
    super();

    const positions = [];
    const uvs = [];
    const normals = [];
    const datas = [];
    const indices = [];

    const tMap = Assets.get("rippling");
    // const ratio = tMap.width / tMap.height;
    const ratio = 1;
    const ry = 4;
    const rx = ry * ratio;

    const getPos = () => {
      return [random(-rx, rx), random(-ry, ry), random(0.1) * 0.1];
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
        datas.push([random(0.5, 1), random(), random()]);
        indices.push(count);
      }
    }

    this.bound = [rx, ry];
    const mesh = new Mesh(GL.POINTS)
      .bufferVertex(positions)
      .bufferTexCoord(uvs)
      .bufferNormal(normals)
      .bufferData(datas, "aData", 3)
      .bufferIndex(indices);

    this.setMesh(mesh)
      .useProgram(vs, fs)
      .bindTexture("uColorMap", tMap, 0)
      .uniform("uBound", this.bound);
  }
}
