import { Draw, Geom } from "alfrid";
import { random, randomInt } from "./utils";
import vs from "shaders/chars.vert";
import fs from "shaders/chars.frag";

export default class DrawChars extends Draw {
  constructor(mSize) {
    super();
    let num = randomInt(10, 25);
    // num = 10;
    this.num = num;

    const mesh = Geom.plane(1, 1, 1);

    const positions = [];
    const uvs = [];
    const extras = [];

    const gap = mSize / (num * 2 + 1);
    for (let j = -num; j <= num; j++) {
      for (let i = -num; i <= num; i++) {
        positions.push([i * gap, j * gap, gap]);
        uvs.push([i / num, j / num]);
        extras.push([random(), random(), random()]);
      }
    }

    mesh
      .bufferInstance(positions, "aPosOffset")
      .bufferInstance(uvs, "aUVOffset")
      .bufferInstance(extras, "aExtra");

    this.setMesh(mesh).useProgram(vs, fs).uniform("uNum", "float", num);
  }
}
