import { GL, Draw, Geom, ShaderLibs, FrameBuffer } from "alfrid";

import { random } from "./utils";
import fs from "shaders/noise.frag";

let draw;

export default class NoiseMap extends FrameBuffer {
  constructor(mSize = 512) {
    super(mSize, mSize, { type: GL.FLOAT });

    this.seed = random(100);
    this.noiseScale = 2;
    this.speed = 1;

    if (!draw) {
      draw = new Draw()
        .setMesh(Geom.bigTriangle())
        .useProgram(ShaderLibs.bigTriangleVert, fs)
        .setClearColor(0, 0, 0, 1);
    }

    this.update();
  }

  update() {
    this.seed += 0.002 * this.speed;

    draw
      .bindFrameBuffer(this)
      .uniform("uSeed", this.seed)
      .uniform("uNoiseScale", this.noiseScale)
      .draw();

    return this.texture;
  }
}
