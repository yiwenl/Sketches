import { GL, Draw, FboPingPong, ShaderLibs, Geom } from "alfrid";
// import Assets from "./Assets";

import fs from "shaders/blur.frag";

export default function (mSource) {
  const fboSize = 2048;
  const fbo = new FboPingPong(fboSize, fboSize, {
    minFilter: GL.LINEAR,
    magFilter: GL.LINEAR,
  });
  const draw = new Draw()
    .setMesh(Geom.bigTriangle())
    .useProgram(ShaderLibs.bigTriangleVert, fs)
    .setClearColor(0, 0, 0, 1);

  const numLevels = 7;
  for (let i = 0; i < numLevels; i++) {
    const mul = 1 / Math.pow(2, i);
    const tSource = i === 0 ? mSource : fbo.read.texture;

    draw
      .bindFrameBuffer(fbo.write)
      .bindTexture("uMap", tSource, 0)
      .uniform("uDirection", [1, 0])
      .uniform("uResolution", [fboSize * mul, fboSize * mul])
      .draw();

    fbo.swap();

    draw
      .bindFrameBuffer(fbo.write)
      .bindTexture("uMap", fbo.read.texture, 0)
      .uniform("uDirection", [0, 1])
      .uniform("uResolution", [fboSize * mul, fboSize * mul])
      .draw();

    fbo.swap();
  }

  return fbo.read.texture;
}
