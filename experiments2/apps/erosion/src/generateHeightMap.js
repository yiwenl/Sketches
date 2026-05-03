import { Draw, FboPingPong, GL, Geom, ShaderLibs } from "@alfrid";
import MapConstants from "./MapConstants";
import Config from "./Config";
import fs from "./shaders/heightmap-gen.frag";

export default function generateHeightMap(
  size = MapConstants.TEXTURE_SIZE,
  noiseStrength = Config.heightNoise
) {
  const fbo = new FboPingPong(size, size, {
    minFilter: GL.LINEAR,
    magFilter: GL.LINEAR,
    type: GL.FLOAT,
  });

  new Draw()
    .setMesh(Geom.bigTriangle())
    .useProgram(ShaderLibs.bigTriangleVert, fs)
    .setClearColor(0, 0, 0, 0)
    .bindFrameBuffer(fbo.read)
    .uniform("uMaxHeight", MapConstants.MAX_HEIGHT)
    .uniform("uSeed", Math.random() * 0xff)
    .uniform("uNoiseStrength", noiseStrength)
    .draw();

  return fbo;
}
