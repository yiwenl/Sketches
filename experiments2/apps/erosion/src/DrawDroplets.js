import { Draw, GL, Mesh } from "@alfrid";

import Config from "./Config";
import vs from "./shaders/droplets.vert";
import fs from "./shaders/droplets.frag";
import { random } from "@utils";

import MapConstants from "./MapConstants";

export default class DrawDroplets extends Draw {
  constructor() {
    super();

    const { numDroplets: num } = Config;
    const positions = [];
    const indices = [];

    for (let j = 0; j < num; j++) {
      for (let i = 0; i < num; i++) {
        positions.push([
          i / num + 0.5 / num,
          j / num + 0.5 / num,
          random(0.5, 1),
        ]);
        indices.push(j * num + i);
      }
    }

    const mesh = new Mesh(GL.POINTS)
      .bufferVertex(positions)
      .bufferIndex(indices);

    this.setMesh(mesh)
      .useProgram(vs, fs)
      .uniform("uMapSize", MapConstants.MAP_SIZE);
  }
}
