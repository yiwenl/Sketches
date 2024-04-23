import { GL, Draw, Geom, FrameBuffer, ShaderLibs } from "alfrid";
import { random } from "./utils";
import fs from "shaders/noise.frag";

export default function generateNoiseTexture() {
  const fboSize = 2048;
  const fbo = new FrameBuffer(fboSize, fboSize, {
    wrapS: GL.REPEAT,
    wrapT: GL.REPEAT,
  });

  new Draw()
    .setMesh(Geom.bigTriangle())
    .useProgram(ShaderLibs.bigTriangleVert, fs)
    .setClearColor(1, 1, 1, 1)
    .bindFrameBuffer(fbo)
    .uniform("uSeed", random())
    .draw();

  return fbo.texture;
}
