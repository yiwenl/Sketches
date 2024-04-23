import { GL, FboPingPong, Draw, Geom, ShaderLibs } from "alfrid";
import Scheduler from "scheduling";
import fs from "shaders/fluidbg.frag";

let fbo, draw;

export const updateFluidBg = (fluid) => {
  const { velocity, density } = fluid;

  if (!fbo) {
    const fboSize = 512;
    fbo = new FboPingPong(fboSize, fboSize, {
      minFilter: GL.LINEAR,
      magFilter: GL.LINEAR,
      type: GL.FLOAT,
    });

    fbo.all.forEach((f) => {
      f.bind();
      GL.clear(0, 0, 0, 1);
      f.unbind();
    });

    draw = new Draw()
      .setMesh(Geom.bigTriangle())
      .useProgram(ShaderLibs.bigTriangleVert, fs)
      .setClearColor(0, 0, 0, 1);
  }

  draw
    .bindFrameBuffer(fbo.write)
    .bindTexture("uMap", fbo.read.texture, 0)
    .bindTexture("uFluidMap", velocity, 1)
    .bindTexture("uDensityMap", density, 2)
    .uniform("uTime", Scheduler.getElapsedTime() * 0.05)
    .draw();

  fbo.swap();

  return fbo.read.texture;
};
