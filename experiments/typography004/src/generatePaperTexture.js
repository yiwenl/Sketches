import { GL, Draw, Geom, FrameBuffer, ShaderLibs } from "alfrid";
import { targetWidth, targetHeight } from "./features";
import { random } from "./utils";
import fs from "shaders/paper.frag";

export default function generatePaperTexture() {
  const fbo = new FrameBuffer(targetWidth, targetHeight);

  new Draw()
    .setMesh(Geom.bigTriangle())
    .useProgram(ShaderLibs.bigTriangleVert, fs)
    .setClearColor(1, 1, 1, 1)
    .bindFrameBuffer(fbo)
    .uniform("uSeed", random())
    .uniform("uRatio", GL.aspectRatio)
    .draw();

  return fbo.texture;
}
