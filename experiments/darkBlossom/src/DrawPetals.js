import { Geom, Draw } from "alfrid";
import { random } from "./utils";
import Config from "./Config";

import vs from "shaders/petals.vert";
import fs from "shaders/petals.frag";

export default class DrawPetals extends Draw {
  constructor() {
    super();

    const { numParticles: num } = Config;

    const s = 0.05;
    const mesh = Geom.plane(s, s, 1, "xz");
    const uvOffset = [];
    const extras = [];

    for (let j = 0; j < num; j++) {
      for (let i = 0; i < num; i++) {
        uvOffset.push([(i + 0.5) / num, (j + 0.5) / num]);
        extras.push([random(), random(), random(), random()]);
      }
    }

    mesh.bufferInstance(uvOffset, "aUVOffset").bufferInstance(extras, "aExtra");

    this.setMesh(mesh).useProgram(vs, fs);
  }
}
