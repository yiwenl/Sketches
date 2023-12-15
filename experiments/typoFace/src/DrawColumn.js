import { Draw, Geom } from "alfrid";
import Config from "./Config";

import { random } from "./utils";
import vs from "shaders/column.vert";
import fs from "shaders/column.frag";

export default class DrawColumn extends Draw {
  constructor(mSize) {
    super();

    const s = mSize * 0.2;
    const mesh = Geom.plane(s, s, 1);

    const numX = 10;
    const numY = 5;

    const posOffsets = [];
    const extras = [];
    for (let x = -numX; x <= numX; x += s) {
      let movingSpeed = random(0.3, 0.5);
      if (random() < 0.25) movingSpeed = random(4, 6);
      for (let y = -numY; y <= numY; y += s) {
        posOffsets.push([x, y, movingSpeed]);
        extras.push([random(), random(), random()]);
      }
    }

    mesh
      .bufferInstance(posOffsets, "aPosOffset")
      .bufferInstance(extras, "aExtra");

    this.setMesh(mesh)
      .useProgram(vs, fs)
      .uniform("uNumChars", Config.numLevel)
      .uniform("uThresholdInvert", random(0.2, 0.5))
      .uniform("uSeed", random(-numX, numX));
  }
}
