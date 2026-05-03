import { Draw, FrameBuffer, GL, Geom, ShaderLibs } from "@alfrid";
import fs from "./shaders/splat-gen.frag";

export default function generateSplatMap(size = 128) {
  const MAP_TEXTURE_SETTINGS = {
    minFilter: GL.LINEAR,
    magFilter: GL.LINEAR,
    type: GL.FLOAT,
  };
  const fbo = new FrameBuffer(size, size, MAP_TEXTURE_SETTINGS);

  new Draw()
    .setMesh(Geom.bigTriangle())
    .useProgram(ShaderLibs.bigTriangleVert, fs)
    .setClearColor(0, 0, 0, 0)
    .bindFrameBuffer(fbo)
    .uniform("uSeed", Math.random() * 0xff)
    .uniform("uRadius", 0.5)
    .uniform("uCenterUV", [0.5, 0.5])
    .uniform("uSplatValue", 1)
    .draw();

  return fbo.texture;
}
