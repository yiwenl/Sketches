import { Draw, FrameBuffer, GL, Geom, ShaderLibs } from "@alfrid";
import Constants from "./Constants";
import fs from "./shaders/normalmap-gen.frag";

let draw, fbo;

export default function generateNormalMap(mHeightMap) {
  const { TEXTURE_SIZE: size } = Constants;
  const NORMAL_MAP_TEXTURE_SETTINGS = {
    minFilter: GL.LINEAR,
    magFilter: GL.LINEAR,
  };

  if (!fbo) {
    fbo = new FrameBuffer(size, size, NORMAL_MAP_TEXTURE_SETTINGS);

    draw = new Draw()
      .setMesh(Geom.bigTriangle())
      .useProgram(ShaderLibs.bigTriangleVert, fs)
      .setClearColor(0, 0, 0, 0)
      .bindFrameBuffer(fbo);
  }

  draw.bindTexture("uHeightMap", mHeightMap, 0).draw();

  return fbo.texture;
}
