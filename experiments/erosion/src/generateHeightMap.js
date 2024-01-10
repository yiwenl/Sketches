import { GL, Draw, Geom, FrameBuffer, ShaderLibs } from "alfrid";
import { random } from "./utils";
import fs from "shaders/height.frag";

export default function generateHeightMap() {
  const fboSize = 1024;

  const fbo = new FrameBuffer(fboSize, fboSize, {
    minFilter: GL.NEAREST,
    magFilter: GL.NEAREST,
    type: GL.FLOAT,
  });

  new Draw()
    .setMesh(Geom.bigTriangle())
    .useProgram(ShaderLibs.bigTriangleVert, fs)
    .bindFrameBuffer(fbo)
    .setClearColor(0, 0, 0, 1)
    .uniform("uSeed", random(100))
    .draw();

  return fbo.texture;
}
