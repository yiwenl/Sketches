import { Draw, Geom, ShaderLibs, FboPingPong } from "alfrid";
import fs from "shaders/blur.frag";
const numLevel = 3;
const fboSize = 1024;

let draw, fbo;

export default function applyBlur(mSource) {
  if (!fbo) {
    fbo = new FboPingPong(fboSize, fboSize);
    draw = new Draw()
      .setMesh(Geom.bigTriangle())
      .useProgram(ShaderLibs.bigTriangleVert, fs)
      .setClearColor(0, 0, 0, 1);
  }

  for (let i = 0; i < numLevel; i++) {
    let tSource = i === 0 ? mSource : fbo.read.texture;

    let mul = Math.pow(2.0, i);
    mul = 1;

    draw
      .bindFrameBuffer(fbo.write)
      .bindTexture("texture", tSource, 0)
      .uniform("uResolution", [fboSize / mul, fboSize / mul])
      .uniform("uDirection", [1, 0])
      .draw();

    fbo.swap();

    draw
      .bindFrameBuffer(fbo.write)
      .bindTexture("texture", fbo.read.texture, 0)
      .uniform("uResolution", [fboSize / mul, fboSize / mul])
      .uniform("uDirection", [0, 1])
      .draw();

    fbo.swap();
  }

  return fbo.read.texture;
}
