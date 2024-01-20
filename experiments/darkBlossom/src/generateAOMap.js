import { Draw, Geom, FrameBuffer, ShaderLibs } from "alfrid";
import fs from "shaders/ao.frag";
let draw, fbo;

export default function (mDepthMap) {
  if (!fbo) {
    let s = 1;
    fbo = new FrameBuffer(mDepthMap.width * s, mDepthMap.height * s);
    s = 1;
    draw = new Draw()
      .setMesh(Geom.bigTriangle())
      .useProgram(ShaderLibs.bigTriangleVert, fs)
      .setClearColor(0, 0, 0, 1)
      .bindFrameBuffer(fbo)
      .uniform("uScreenSize", [mDepthMap.width * s, mDepthMap.height * s])
      .uniform("uRadius", 0.5);
  }

  draw.bindTexture("uDepthMap", mDepthMap, 0).draw();

  return fbo.texture;
}
