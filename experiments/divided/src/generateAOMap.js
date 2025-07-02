import { Draw, Geom, FrameBuffer, ShaderLibs } from "alfrid";
import Config from "./Config";
import fs from "shaders/ao.frag";
let draw, fbo;

export default function (mDepthMap, { near, far }) {
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

  draw
    .bindTexture("uDepthMap", mDepthMap, 0)
    .uniform("uDepthThreshold", Config.depthThreshold)
    .uniform("uNear", near)
    .uniform("uFar", far)
    .uniform("uAoRange", Config.aoRange)
    .draw();

  return fbo.texture;
}
