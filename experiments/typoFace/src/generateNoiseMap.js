import { GL, Draw, Geom, FrameBuffer, ShaderLibs } from "alfrid";
import { random } from "./utils";

import fs from "shaders/noisemap.frag";

let draw, fbo, seed;
export default function generate() {
  if (!draw) {
    seed = random(100);
    const mapSize = 256;

    fbo = new FrameBuffer(mapSize, mapSize, { type: GL.FLOAT });
    draw = new Draw()
      .setMesh(Geom.bigTriangle())
      .useProgram(ShaderLibs.bigTriangleVert, fs)
      .setClearColor(0, 0, 0, 1)
      .bindFrameBuffer(fbo);
  }

  draw.uniform("uSeed", seed).draw();
  seed += 0.002;

  return fbo.texture;
}
