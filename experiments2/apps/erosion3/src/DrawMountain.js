import { Draw, Geom } from "@alfrid";
import Constants from "./Constants";

import vs from "./shaders/mountain.vert";
import fs from "./shaders/mountain.frag";

export default class DrawMountain extends Draw {
  constructor() {
    super();

    const mapSize = Constants.MAP_SIZE;
    const numTile = 8;
    const mesh = Geom.plane(1, 1, 100, "xz");
    const s = (mapSize / numTile) * 2;

    const posOffsets = [];
    for (let i = 0; i < numTile; i++) {
      for (let j = 0; j < numTile; j++) {
        let x = -Constants.MAP_SIZE + i * s;
        let y = -Constants.MAP_SIZE + j * s;
        posOffsets.push([x, y, s]);
      }
    }

    mesh.bufferInstance(posOffsets, "aPosOffset");

    this.setMesh(mesh)
      .useProgram(vs, fs)
      .uniform("uMapSize", mapSize)
      .uniform("uMaxHeight", Constants.MAX_HEIGHT);
  }
}
