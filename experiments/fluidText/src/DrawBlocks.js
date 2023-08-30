import { Draw, Geom } from "alfrid";

import { random } from "./utils";
import vs from "shaders/blocks.vert";
import fs from "shaders/blocks.frag";

export default class DrawBlocks extends Draw {
  constructor() {
    super();

    const s = 0.2;
    const t = 1;
    const mesh = Geom.plane(s * t, s * t, 1);

    const positions = [];
    const uvs = [];
    const extra = [];
    let num = 30;
    for (let i = 0; i < num; i++) {
      for (let j = 0; j < num; j++) {
        let x = i * s - s * num * 0.5;
        let y = j * s - s * num * 0.5;
        positions.push([x, y, 0]);
        uvs.push([i / num, j / num]);
        extra.push([random(), random(), random()]);
      }
    }

    const numChars = 16 * 16;

    mesh
      .bufferInstance(positions, "aPosOffset")
      .bufferInstance(uvs, "aUV")
      .bufferInstance(extra, "aExtra");

    this.setMesh(mesh).useProgram(vs, fs).uniform("uNumChars", numChars);
  }
}
