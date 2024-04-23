import { Draw, Geom } from "alfrid";
import Config from "./Config";

import vs from "shaders/stars.vert";
import fs from "shaders/blocks.frag";

export default class DrawStars extends Draw {
  constructor() {
    super();

    const mesh = Geom.sphere(0.1, 36);

    const positions = [];
    const { numStars } = Config;
    for (let i = 0; i < numStars; i++) {
      positions.push([0, 0, 0, 0.1]);
    }

    mesh.bufferInstance(positions, "aPosAndSize");

    this.setMesh(mesh).useProgram(vs, fs);
    this.mesh = mesh;
  }
}
