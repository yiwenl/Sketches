import { Draw, Geom } from "alfrid";

import Config from "./Config";
import vs from "shaders/terrain.vert";
import fs from "shaders/terrain.frag";

export default class DrawTerrain extends Draw {
  constructor() {
    super();

    const s = Config.terrainSize;
    const mesh = Geom.plane(s, s, 250, "xz");
    this.setMesh(mesh).useProgram(vs, fs);
  }
}
