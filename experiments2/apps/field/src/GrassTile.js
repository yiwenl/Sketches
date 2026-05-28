import { Draw } from "@alfrid";
import { random } from "@utils";
import generateGrassGeometry from "./GrassGeometry";
import { TILE_SIZE, INSTANCES_PER_TILE } from "./Constants";

import vs from "./shaders/grass.vert";
import fs from "./shaders/grass.frag";

const buildDraw = (numLevels, cx, cz) => {
  const mesh = generateGrassGeometry({ numLevels });

  const half = TILE_SIZE / 2;
  const posOffsets = [];
  const seeds = [];

  for (let i = 0; i < INSTANCES_PER_TILE; i++) {
    posOffsets.push([cx + random(-half, half), 0, cz + random(-half, half)]);
    seeds.push([random(), random(), random()]);
  }

  mesh
    .bufferInstance(posOffsets, "aInstancePosition", 3)
    .bufferInstance(seeds, "aInstanceSeed", 3);

  return new Draw().setMesh(mesh).useProgram(vs, fs);
};

export default class GrassTile {
  constructor(cx, cz) {
    this.cx = cx;
    this.cz = cz;

    this._high = buildDraw(8, cx, cz);
    this._low = buildDraw(4, cx, cz);
  }

  drawHigh(uOffset, color, curlMap, fieldSize, maxFloorHeight) {
    this._high
      .uniform("uOffset", uOffset)
      .uniform("uColor", color)
      .bindTexture("uCurlMap", curlMap, 0)
      .uniform("uFieldSize", fieldSize)
      .uniform("uMaxFloorHeight", maxFloorHeight)
      .draw();
  }

  drawLow(color, curlMap, fieldSize, maxFloorHeight) {
    this._low
      .uniform("uOffset", 1)
      .uniform("uColor", color)
      .bindTexture("uCurlMap", curlMap, 0)
      .uniform("uFieldSize", fieldSize)
      .uniform("uMaxFloorHeight", maxFloorHeight)
      .draw();
  }
}
