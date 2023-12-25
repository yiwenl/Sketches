import { Draw, Geom } from "alfrid";
import vs from "shaders/fluid-map.vert";
import fs from "shaders/fluid-map.frag";

export default class DrawFluid extends Draw {
  constructor() {
    super();

    const s = 15;
    this.mesh = Geom.plane(s, s, 1);
    this.setMesh(this.mesh).useProgram(vs, fs).setClearColor(0, 0, 0, 1);
    this.meshSize = s;
  }
}
