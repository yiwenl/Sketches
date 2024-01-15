import { Draw, Geom, FrameBuffer, ShaderLibs } from "alfrid";
import { random } from "./utils";
import fs from "shaders/paper.frag";

export default function generatePaperTexture() {
  const fboSize = 2048;
  const fbo = new FrameBuffer(fboSize, fboSize);

  new Draw()
    .setMesh(Geom.bigTriangle())
    .useProgram(ShaderLibs.bigTriangleVert, fs)
    .setClearColor(1, 1, 1, 1)
    .bindFrameBuffer(fbo)
    .uniform("uSeed", random())
    .uniform("uRatio", 1)
    .draw();

  return fbo.texture;
}
