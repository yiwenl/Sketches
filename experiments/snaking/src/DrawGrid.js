import { Draw, Geom } from "alfrid";
import { random, randomInt } from "./utils";
import { vec3, mat4 } from "gl-matrix";

import vs from "shaders/grid.vert";
import fs from "shaders/grid.frag";
import fs2 from "shaders/grid2.frag";

export default class DrawGrid extends Draw {
  constructor() {
    super();

    const s = 0.2;
    const mesh = Geom.plane(s, s, 1);

    const positions = [];
    const num = Math.floor(8 / s);
    for (let i = -num; i <= num; i++) {
      for (let j = -num; j <= num; j++) {
        positions.push([i * s, j * s, randomInt(4)]);
      }
    }
    mesh.bufferInstance(positions, "aOffset");

    this.setMesh(mesh).useProgram(vs, fs2);
  }
}
