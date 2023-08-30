import { Draw } from "alfrid";
import Assets from "./Assets";

import vs from "shaders/mask.vert";
import fs from "shaders/mask.frag";

export default class DrawMask extends Draw {
  constructor() {
    super();

    this.setMesh(Assets.get("mask")).useProgram(vs, fs);
  }
}
