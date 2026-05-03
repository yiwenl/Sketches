import { Draw, FrameBuffer, GL, Geom, ShaderLibs } from "@alfrid";
import MapConstants from "./MapConstants";
import fs from "./shaders/normalmap-gen.frag";

let draw, fbo;

export default function generateNormalMap(mHeightMap) {
  const size = MapConstants.TEXTURE_SIZE;

  if (!fbo) {
    fbo = new FrameBuffer(size, size, {
      minFilter: GL.LINEAR,
      magFilter: GL.LINEAR,
    });

    draw = new Draw()
      .setMesh(Geom.bigTriangle())
      .useProgram(ShaderLibs.bigTriangleVert, fs)
      .setClearColor(0, 0, 0, 0)
      .bindFrameBuffer(fbo);
  }

  draw.bindTexture("uHeightMap", mHeightMap, 0).draw();

  return fbo.texture;
}
