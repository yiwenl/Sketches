import { Geom, Draw } from "alfrid";

import Config from "./Config";
import vs from "shaders/floor.vert";
import fs from "shaders/floor.frag";

export default class DrawFloor extends Draw {
  constructor() {
    const s = 50;
    const mesh = Geom.plane(s, s, 1, "xz");
    super();

    const { vertices } = mesh;
    const { floorLevel } = Config;

    const positions = vertices.map((v) => [v[0], floorLevel, v[2]]);
    mesh.bufferVertex(positions);
    this.setMesh(mesh).useProgram(vs, fs);

    this.mesh = mesh;
  }
}
