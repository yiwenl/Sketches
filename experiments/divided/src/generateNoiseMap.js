import { GL, Draw, Geom, FrameBuffer, ShaderLibs } from "alfrid";
import { random } from "./utils";
import fs from "shaders/noise.frag";

export default function generateNoiseMap() {
  const fboSize = 2048;
  const fbo = new FrameBuffer(fboSize, fboSize, {
    minFilter: GL.NEAREST,
    magFilter: GL.NEAREST,
    wrapS: GL.REPEAT,
    wrapT: GL.REPEAT,
  });

  new Draw()
    .setMesh(Geom.bigTriangle())
    .useProgram(ShaderLibs.bigTriangleVert, fs)
    .bindFrameBuffer(fbo)
    .setClearColor(0, 0, 0, 1)
    .uniform("uSeeds", [random(100), random(100), random(100)])
    .draw();

  return fbo.texture;
}
