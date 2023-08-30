import { GL, Draw, Geom, ShaderLibs, FrameBuffer } from "alfrid";
import { random, randomInt } from "./utils";
import fs from "shaders/fluidNoise.frag";

let draw, fbo;

export default function generate() {
  if (!draw) {
    const fboSize = 1024;
    fbo = new FrameBuffer(fboSize, fboSize, { type: GL.FLOAT });
    draw = new Draw()
      .setMesh(Geom.bigTriangle())
      .useProgram(ShaderLibs.bigTriangleVert, fs)
      .bindFrameBuffer(fbo)
      .setClearColor(0, 0, 0, 1);
  }

  function updateNoise() {
    draw
      .uniform("uSeed", random(10))
      .uniform("uNoiseScale", random(1, 2))
      .draw();

    setTimeout(() => {
      updateNoise();
    }, randomInt(2000, 4000));
  }

  updateNoise();

  return fbo.texture;
}
