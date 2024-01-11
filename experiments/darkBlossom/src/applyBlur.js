import { GL, Draw, FboPingPong, ShaderLibs, Geom } from "alfrid";

import fs from "shaders/blur.frag";

let fbo, draw;

export default function (mSource) {
  const { width, height } = GL;
  // const fboSize = 2048;
  if (!fbo) {
    const s = 0.5;
    fbo = new FboPingPong(width * s, height * s, {
      minFilter: GL.LINEAR,
      magFilter: GL.LINEAR,
    });

    draw = new Draw()
      .setMesh(Geom.bigTriangle())
      .useProgram(ShaderLibs.bigTriangleVert, fs)
      .setClearColor(0, 0, 0, 1);
  }

  const numLevels = 1;
  for (let i = 0; i < numLevels; i++) {
    const mul = 1 / Math.pow(1.2, i);
    const tSource = i === 0 ? mSource : fbo.read.texture;

    draw
      .bindFrameBuffer(fbo.write)
      .bindTexture("uMap", tSource, 0)
      .uniform("uDirection", [1, 0])
      .uniform("uResolution", [width * mul, height * mul])
      .draw();

    fbo.swap();

    draw
      .bindFrameBuffer(fbo.write)
      .bindTexture("uMap", fbo.read.texture, 0)
      .uniform("uDirection", [0, 1])
      .uniform("uResolution", [width * mul, height * mul])
      .draw();

    fbo.swap();
  }

  return fbo.read.texture;
}
