import { Draw, Geom, FrameBuffer, ShaderLibs } from "alfrid";
import fs from "shaders/normal.frag";
let draw, fbo;

export default function (mHeightMap) {
  if (!fbo) {
    const s = 2.0;
    fbo = new FrameBuffer(mHeightMap.width, mHeightMap.height);
    draw = new Draw()
      .setMesh(Geom.bigTriangle())
      .useProgram(ShaderLibs.bigTriangleVert, fs)
      .setClearColor(0, 0, 0, 1)
      .bindFrameBuffer(fbo)
      .uniform("uTextureSize", [mHeightMap.width * s, mHeightMap.height * s]);

    // console.log(mHeightMap.width, mHeightMap.height);
  }

  draw.bindTexture("uHeightMap", mHeightMap, 0).draw();

  return fbo.texture;
}
