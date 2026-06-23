import { Draw, Geom, FrameBuffer, ShaderLibs, GL } from "alfrid";
import { random } from "./utils";
import fs from "shaders/fluidNoiseMap.frag";

let draw;
let fboVelocity;
let fboDensity;
let currentSize = 0;
const seedVelocity = random(1000);
const seedDensity = random(1000);

const initResources = (size) => {
  currentSize = size;
  const oSettings = {
    minFilter: GL.LINEAR,
    magFilter: GL.LINEAR,
    wrapS: GL.MIRRORED_REPEAT,
    wrapT: GL.MIRRORED_REPEAT,
    type: GL.FLOAT,
  };
  fboVelocity = new FrameBuffer(size, size, oSettings);
  fboDensity = new FrameBuffer(size, size, oSettings);
  draw = new Draw()
    .setMesh(Geom.bigTriangle())
    .useProgram(ShaderLibs.bigTriangleVert, fs)
    .setClearColor(0, 0, 0, 1)
    .uniform("uScale", 4)
    .uniform("uVelocityStrength", 0.0015)
    .uniform("uDensityStrength", 0.2);
};

export default function generateFluidNoiseMap(
  type,
  time,
  size = 128,
  noiseAmount = 1
) {
  if (!draw || currentSize !== size) {
    initResources(size);
  }

  const isVelocity = type === "velocity";
  const target = isVelocity ? fboVelocity : fboDensity;
  const mode = isVelocity ? 0 : 1;
  const seed = isVelocity ? seedVelocity : seedDensity;

  draw
    .bindFrameBuffer(target)
    .uniform("uTime", time)
    .uniform("uSeed", seed)
    .uniform("uMode", mode)
    .uniform("uNoiseAmount", noiseAmount)
    .draw();

  return target.texture;
}
