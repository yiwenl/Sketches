import { GL, Draw, Geom, ShaderLibs, FrameBuffer } from "alfrid";

import { random } from "./utils";
import fs from "shaders/noise.frag";

let draw;

export default class NoiseMap extends FrameBuffer {
  constructor(mSize = 512, mMono = false) {
    super(mSize, mSize, { type: GL.FLOAT });

    this.seed = random(100);
    this.noiseScale = 1;
    this.monochrome = mMono;

    if (!draw) {
      draw = new Draw()
        .setMesh(Geom.bigTriangle())
        .useProgram(ShaderLibs.bigTriangleVert, fs)
        .setClearColor(0, 0, 0, 1);
    }

    this.update();
  }

  update() {
    this.seed += 0.04;

    draw
      .bindFrameBuffer(this)
      .uniform("uSeed", this.seed)
      .uniform("uNoiseScale", this.noiseScale)
      .uniform("uMonochrome", this.monochrome ? 1.0 : 0.0)
      .draw();

    return this.texture;
  }
}
