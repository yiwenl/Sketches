import { Draw } from "@alfrid";
import generateGrassGeometry from "./GrassGeometry";

import vs from "./shaders/grass.vert";
import fs from "./shaders/grass.frag";

export default class DrawGrassLow extends Draw {
  constructor() {
    super();

    // numLevels=8 → 15 vertices (high LOD); use numLevels=4 for 7 vertices (low LOD)
    const mesh = generateGrassGeometry({ numLevels: 4 });

    this.setMesh(mesh).useProgram(vs, fs).uniform("uOffset", 1);
  }
}
