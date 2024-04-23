import { Draw } from "alfrid";

import vs from "shaders/debugFluid.vert";
import fs from "shaders/debugFluid.frag";

export default class DrawDebugFluid extends Draw {
  constructor(mMesh) {
    super().setMesh(mMesh).useProgram(vs, fs);
  }
}
