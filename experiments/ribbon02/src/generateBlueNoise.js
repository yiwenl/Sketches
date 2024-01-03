import { GL, Draw, Geom, FrameBuffer, ShaderLibs } from "alfrid";
import { random } from "./utils";
import fs from "shaders/blue-noise.frag";
let draw, fbo, seed;

export default function () {
  if (!fbo) {
    fbo = new FrameBuffer(GL.width, GL.height, {
      wrapS: GL.MIRRORED_REPEAT,
      wrapT: GL.MIRRORED_REPEAT,
    });
    seed = random(1000);
    draw = new Draw()
      .setMesh(Geom.bigTriangle())
      .useProgram(ShaderLibs.bigTriangleVert, fs)
      .setClearColor(0, 0, 0, 1)
      .bindFrameBuffer(fbo)
      .uniform("uTime", seed)
      .uniform("uResolution", [GL.width, GL.height]);
  }

  draw.draw();

  seed += 0.01;

  return fbo.texture;
}
