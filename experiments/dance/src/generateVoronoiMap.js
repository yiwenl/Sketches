import { Draw, Geom, ShaderLibs, FrameBuffer } from "alfrid";
import { random } from "./utils";
import fs from "./shaders/voronoi.frag";

export default function () {
  const fboSize = 1024;

  const fbo = new FrameBuffer(fboSize, fboSize);
  new Draw()
    .setMesh(Geom.bigTriangle())
    .useProgram(ShaderLibs.bigTriangleVert, fs)
    .bindFrameBuffer(fbo)
    .setClearColor(0, 0, 0, 1)
    .uniform("uSeed", random(10))
    .uniform("uScale", 100)
    .draw();

  return fbo.texture;
}
