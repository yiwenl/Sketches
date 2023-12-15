import { GL, Draw, DrawCopy, FboPingPong, Geom, ShaderLibs } from "alfrid";

import fs from "shaders/blur.frag";
import fsThreshold from "shaders/threshold.frag";

let fbo, draw, drawCopy, drawThreshold;
export default function applyBlur(
  mSource,
  mTarget,
  mBlur = 1,
  mThreshold = 0.5
) {
  const mapSize = 1024 * 2;
  if (!fbo) {
    fbo = new FboPingPong(mapSize, mapSize);
    drawCopy = new DrawCopy();
    draw = new Draw()
      .setMesh(Geom.bigTriangle())
      .useProgram(ShaderLibs.bigTriangleVert, fs)
      .setClearColor(0, 0, 0, 0);

    drawThreshold = new Draw()
      .setMesh(Geom.bigTriangle())
      .useProgram(ShaderLibs.bigTriangleVert, fsThreshold)
      .setClearColor(0, 0, 0, 0);
  }

  const numPasses = 3;

  if (mThreshold === 0) {
    mTarget.bind();
    GL.clear(0, 0, 0, 0);
    drawCopy.draw(mSource);
    mTarget.unbind();
  } else {
    for (let i = 0; i < numPasses; i++) {
      const mul = (1 / Math.pow(2, i)) * mBlur;

      const tSource = i === 0 ? mSource : fbo.read.texture;
      draw
        .bindFrameBuffer(fbo.write)
        .bindTexture("uMap", tSource, 0)
        .uniform("uResolution", [mapSize * mul, mapSize * mul])
        .uniform("uDirection", [1, 0])
        .draw();

      fbo.swap();

      draw
        .bindFrameBuffer(fbo.write)
        .bindTexture("uMap", fbo.read.texture, 0)
        .uniform("uResolution", [mapSize * mul, mapSize * mul])
        .uniform("uDirection", [0, 1])
        .draw();

      fbo.swap();
    }

    drawThreshold
      .bindFrameBuffer(mTarget)
      .bindTexture("uMap", fbo.read.texture, 0)
      .uniform("uThreshold", mThreshold)
      .draw();
  }
}

export const applyBlurWithFboPingPong = (mFbo, mBlur = 1) => {
  const numPasses = 3;
  for (let i = 0; i < numPasses; i++) {
    const mul = (1 / Math.pow(2, i)) * mBlur;

    draw
      .bindFrameBuffer(fbo.write)
      .bindTexture("uMap", mFbo.read.texture, 0)
      .uniform("uResolution", [mapSize * mul, mapSize * mul])
      .uniform("uDirection", [1, 0])
      .draw();

    fbo.swap();

    draw
      .bindFrameBuffer(fbo.write)
      .bindTexture("uMap", fbo.read.texture, 0)
      .uniform("uResolution", [mapSize * mul, mapSize * mul])
      .uniform("uDirection", [0, 1])
      .draw();

    fbo.swap();
  }
};
