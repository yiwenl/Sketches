import { Draw, Geom, ShaderLibs } from "@alfrid";

import MapConstants from "./MapConstants";
import fs from "./shaders/apply-erosion.frag";

export default class DrawApplyErosion extends Draw {
  constructor() {
    super();

    this.setMesh(Geom.bigTriangle())
      .useProgram(ShaderLibs.bigTriangleVert, fs)
      .setClearColor(0, 0, 0, 1)
      .uniform("uSeaLevel", MapConstants.SEA_LEVEL);
  }
}
