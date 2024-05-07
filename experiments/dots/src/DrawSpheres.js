import { Draw, Geom } from "alfrid";

import Config from "./Config";
import { random } from "./utils";

import vs from "shaders/spheres.vert";
import fs from "shaders/spheres.frag";

export default class DrawSpheres extends Draw {
  constructor() {
    super();

    const r = 0.02;
    const mesh = Geom.sphere(r, 12);

    // instancing
    const data = [];
    const { numParticles: num } = Config;

    for (let i = 0; i < num; i++) {
      for (let j = 0; j < num; j++) {
        data.push([i / num, j / num, random(), random()]);
      }
    }

    mesh.bufferInstance(data, "aData");

    this.setMesh(mesh).useProgram(vs, fs);
  }
}
