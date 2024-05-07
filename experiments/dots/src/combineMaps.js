import { GL, Draw, Geom, ShaderLibs, FrameBuffer } from "alfrid";

import fs from "shaders/combine.frag";

let draw, fbo;
export default function combineMaps(mMapA, mMapB) {
  if (!draw) {
    const fboSize = 1024;
    fbo = new FrameBuffer(fboSize, fboSize, {
      minFilter: GL.LINEAR,
      magFilter: GL.LINEAR,
    });

    draw = new Draw()
      .setMesh(Geom.bigTriangle())
      .useProgram(ShaderLibs.bigTriangleVert, fs)
      .setClearColor(0, 0, 0, 1)
      .bindFrameBuffer(fbo);
  }

  draw.bindTexture("uMapA", mMapA, 0).bindTexture("uMapB", mMapB, 1).draw();

  return fbo.texture;
}
