import { FrameBuffer, Draw, ShaderLibs, Geom } from "@alfrid";
import fs from "./shaders/curl-map.frag";
import { random } from "@utils";

let fbo, draw, seed;

export default function generateCurlMap(mOffset = 0, mComplexity = 3.0) {
  if (!fbo) {
    const fboSize = 1024;
    fbo = new FrameBuffer(fboSize, fboSize);
    draw = new Draw()
      .setMesh(Geom.bigTriangle())
      .useProgram(ShaderLibs.bigTriangleVert, fs)
      .bindFrameBuffer(fbo)
      .setClearColor(0, 0, 0, 0);

    seed = random(10000);
  }

  draw.uniform("uOffset", mOffset + seed).uniform("uComplexity", mComplexity).draw();
  return fbo.texture;
}
