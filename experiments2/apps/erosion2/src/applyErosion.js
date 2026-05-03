import { Draw, Geom, ShaderLibs } from "@alfrid";

import fs from "./shaders/apply-erosion.frag";

let draw;

export default function applyErosion(mHeightMap, mErosionMap) {
  if (!draw) {
    draw = new Draw()
      .setMesh(Geom.bigTriangle())
      .useProgram(ShaderLibs.bigTriangleVert, fs)
      .setClearColor(0, 0, 0, 0);
  }

  draw
    .bindFrameBuffer(mHeightMap.write)
    .bindTexture("uHeightMap", mHeightMap.read.texture, 0)
    .bindTexture("uErosionMap", mErosionMap, 1)
    .draw();

  mHeightMap.swap();
}
