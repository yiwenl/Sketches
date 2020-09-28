import alfrid, { GL } from "alfrid";
import Config from "./Config";
import vs from "shaders/blocks.vert";
import fs from "shaders/blocks.frag";

import getColors from "get-color-themes";

class DrawBlocks extends alfrid.Draw {
  constructor() {
    super();

    const { numParticles: num } = Config;

    const s = 0.08;
    const scale = 0.3;
    const mesh = alfrid.Geom.cube(s, s * scale, s * scale);

    const uvOffsets = [];
    const extras = [];

    let count = 0;
    for (let i = 0; i < num; i++) {
      for (let j = 0; j < num; j++) {
        uvOffsets.push([i / num, j / num]);
        extras.push([Math.random(), Math.random(), Math.random()]);
        count++;
      }
    }
    mesh.bufferInstance(uvOffsets, "aUVOffset");
    mesh.bufferInstance(extras, "aExtra");
    // mesh.bufferInstance(colors, "aColor");

    this.setMesh(mesh).useProgram(vs, fs);

    this.resetColor();
  }

  resetColor() {
    const colorTheme = getColors();
    const colorUniforms = colorTheme.reduce((total, c) => {
      total = total.concat(c);
      return total;
    }, []);
    this.uniform("uColors", "vec3", colorUniforms);
  }
}

export default DrawBlocks;
