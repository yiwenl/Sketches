import { Draw } from "@alfrid";
import generateGrassGeometry from "./GrassGeometry";
import { FIELD_SIZE } from "./Constants";
import { random } from "@utils";

import vs from "./shaders/grass.vert";
import fs from "./shaders/grass.frag";

export default class DrawGrassHigh extends Draw {
  constructor() {
    super();

    // numLevels=8 → 15 vertices (high LOD); use numLevels=4 for 7 vertices (low LOD)
    const mesh = generateGrassGeometry({ numLevels: 8 });

    // instancing
    const numInstances = 100000;
    const posOffsets = [];
    const seeds = [];
    let i = numInstances;
    while (i--) {
      posOffsets.push([
        random(-FIELD_SIZE, FIELD_SIZE),
        0,
        random(-FIELD_SIZE, FIELD_SIZE),
      ]);
      seeds.push([random(), random(), random()]);
    }

    mesh
      .bufferInstance(posOffsets, "aInstancePosition", 3)
      .bufferInstance(seeds, "aInstanceSeed", 3);

    this.setMesh(mesh).useProgram(vs, fs).uniform("uOffset", 1);
  }
}
