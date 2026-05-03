import { Draw, FboPingPong, GL, Geom, ShaderLibs } from "@alfrid";
import Constants from "./Constants";
import Config from "./Config";
import fs from "./shaders/heightmap-gen.frag";

export default function generateHeightMap(size = Constants.TEXTURE_SIZE) {
  const { MAX_HEIGHT } = Constants;
  const MAP_TEXTURE_SETTINGS = {
    minFilter: GL.LINEAR,
    magFilter: GL.LINEAR,
    type: GL.FLOAT,
  };
  const fbo = new FboPingPong(size, size, MAP_TEXTURE_SETTINGS);

  new Draw()
    .setMesh(Geom.bigTriangle())
    .useProgram(ShaderLibs.bigTriangleVert, fs)
    .setClearColor(0, 0, 0, 0)
    .bindFrameBuffer(fbo.read)
    .uniform("uMaxHeight", MAX_HEIGHT)
    .uniform("uSeed", Math.random() * 0xff)
    .uniform("uNoiseStrength", Config.noiseStrength)
    .draw();

  return fbo;
}
