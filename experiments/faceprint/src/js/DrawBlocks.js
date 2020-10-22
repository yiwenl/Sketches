import alfrid, { GL } from "alfrid";

import vs from "shaders/blocks.vert";
import fs from "shaders/blocks.frag";

class DrawBlocks extends alfrid.Draw {
  constructor() {
    super();

    const scale = 0.5;
    const s = 0.1 * scale;
    const mesh = alfrid.Geom.plane(s, s, 1, "xy");
    const numX = 10 / scale;
    const numY = 16 / scale;
    const yOffset = 0.5;

    const posOffsets = [];
    const extras = [];
    const z = -0.5;
    for (let i = -numX; i <= numX; i++) {
      for (let j = -numY; j <= numY; j++) {
        posOffsets.push([i * s, j * s + yOffset, z]);
        extras.push([Math.random(), Math.random(), Math.random()]);
      }
    }
    mesh.bufferInstance(posOffsets, "aPosOffset");
    mesh.bufferInstance(extras, "aExtra");

    this.setMesh(mesh).useProgram(vs, fs);
  }
}

export default DrawBlocks;
