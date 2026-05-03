import { GL, Draw, Geom, Object3D } from "@alfrid";
import vs from "./shaders/wall.vert";
import fs from "./shaders/wall.frag";

export default class DrawWall extends Draw {
  constructor() {
    super();
    const ratio = 16 / 12;
    const w = 3;
    const h = w * ratio;

    this.container = new Object3D();
    this.container.y = h * 0.5;
    this.setMesh(Geom.plane(w, h, 1)).useProgram(vs, fs);
  }

  draw() {
    GL.setModelMatrix(this.container.matrix);
    super.draw();
  }
}
