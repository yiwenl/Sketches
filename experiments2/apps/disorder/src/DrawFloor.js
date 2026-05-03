import { GL, Draw, Geom, Object3D } from "@alfrid";
import vs from "./shaders/floor.vert";
import fs from "./shaders/floor.frag";

export default class DrawFloor extends Draw {
  constructor() {
    super();

    this.container = new Object3D();
    const s = 10;
    this.setMesh(Geom.plane(s, s, 1, "xz")).useProgram(vs, fs);
  }

  draw() {
    GL.setModelMatrix(this.container.matrix);
    super.draw();
  }
}
