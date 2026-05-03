import { Draw, Geom } from "@alfrid";

import Config from "./Config";
import MapConstants from "./MapConstants";

import fs from "./shaders/erosion.frag";
import vs from "./shaders/erosion.vert";

export default class DrawErosion extends Draw {
  constructor() {
    super();

    const size = Config.splatRadius;
    const mesh = Geom.plane(size, size, 1, "xy");
    const { numDroplets: num } = Config;

    const uvs = [];

    for (let j = 0; j < num; j++) {
      for (let i = 0; i < num; i++) {
        uvs.push([i / num, j / num]);
      }
    }

    mesh.bufferInstance(uvs, "aUV");

    this.setMesh(mesh)
      .useProgram(vs, fs)
      .uniform("uMapSize", MapConstants.MAP_SIZE)
      .setClearColor(0, 0, 0, 1);
  }
}
