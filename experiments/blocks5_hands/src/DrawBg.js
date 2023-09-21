import { Geom, Draw } from "alfrid";
import Assets from "./Assets";
import vs from "shaders/bg.vert";
import fs from "shaders/bg.frag";

export default class DrawBg extends Draw {
  constructor() {
    const ratio = 564 / 844;
    const s = 20;
    super()
      .setMesh(Geom.plane(s, s / ratio, 1))
      .useProgram(vs, fs)
      .bindTexture("texture", Assets.get("bg"), 0);
  }
}
