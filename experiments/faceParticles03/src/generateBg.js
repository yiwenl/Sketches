import { GL, Draw, FrameBuffer, ShaderLibs, Geom } from "alfrid";
import Config from "./Config";
import { random, toGlsl } from "./utils";
import fs from "shaders/bg.frag";

let draw, fbo;
export default function () {
  if (!fbo) {
    const fboSize = 1024;
    fbo = new FrameBuffer(fboSize, fboSize, {
      minFilter: GL.LINEAR,
      magFilter: GL.LINEAR,
    });

    draw = new Draw()
      .setMesh(Geom.bigTriangle())
      .useProgram(ShaderLibs.bigTriangleVert, fs)
      .setClearColor(0, 0, 0, 1)
      .bindFrameBuffer(fbo)
      .uniform("uSeed", random(10));
  }

  draw
    .uniform("uRatio", GL.aspectRatio)
    .uniform("uColor", Config.colorBg.map(toGlsl))
    .draw();

  return fbo.texture;
}
