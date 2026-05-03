import { Draw, FrameBuffer, GL, Geom, ShaderLibs } from "@alfrid";
import Config from "./Config";
import fs from "./shaders/splat-gen.frag";

export default function generateSplatMap(size = 128) {
  const fbo = new FrameBuffer(size, size, {
    minFilter: GL.LINEAR,
    magFilter: GL.LINEAR,
    type: GL.FLOAT,
  });

  new Draw()
    .setMesh(Geom.bigTriangle())
    .useProgram(ShaderLibs.bigTriangleVert, fs)
    .setClearColor(0, 0, 0, 0)
    .bindFrameBuffer(fbo)
    .uniform("uSeed", Math.random() * 0xff)
    .uniform("uRadius", 0.4)
    .uniform("uCenterUV", [0.5, 0.5])
    .uniform("uSplatValue", Config.splatValue)
    .draw();

  return fbo.texture;
}
