import { Draw } from "alfrid";

import vs from "shaders/basic.vert";
import fs from "shaders/copy.frag";

export default class DrawHitTestArea extends Draw {
  constructor(mMesh) {
    super()
      .setMesh(mMesh)
      .useProgram(vs, fs)
      .uniform("uColor", [1, 1, 1])
      .uniform("uOpacity", 0.5);
  }
}
