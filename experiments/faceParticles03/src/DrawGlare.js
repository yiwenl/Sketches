import { Geom, Draw } from "alfrid";
import vs from "shaders/glare.vert";
import fs from "shaders/glare.frag";

export default class DrawGlare extends Draw {
  constructor() {
    const s = 8;
    super().setMesh(Geom.plane(s, s, 1)).useProgram(vs, fs);
  }
}
