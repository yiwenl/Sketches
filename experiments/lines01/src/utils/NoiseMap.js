import { GL, Draw, Geom, ShaderLibs, FrameBuffer } from "alfrid";
import { random } from "./";

import fs from "shaders/noise.frag";

let draw;

export default class NoiseMap extends FrameBuffer {
  constructor(mMono = false, mNormalize = false, mSize = 512) {
    super(mSize, mSize, {
      minFilter: GL.LINEAR,
      magFilter: GL.LINEAR,
      type: GL.FLOAT,
    });

    this.seed = random(100);
    this.noiseScale = 4;
    this.speed = 1;
    this.mono = mMono;
    this.normalize = mNormalize;

    if (!draw) {
      draw = new Draw()
        .setMesh(Geom.bigTriangle())
        .useProgram(ShaderLibs.bigTriangleVert, fs)
        .setClearColor(0, 0, 0, 0);
    }

    this.time = random(10);

    this.update();
  }

  update() {
    this.time += 0.001;
    this.seed += this.speed * 0.0003;

    draw
      .bindFrameBuffer(this)
      .uniform("uSeed", this.seed)
      .uniform("uNoiseScale", this.noiseScale + Math.sin(this.time) * 0.2)
      .uniform("uMono", this.mono ? 1 : 0)
      .uniform("uNormalize", this.normalize ? 1 : 0)
      .draw();
  }
}
