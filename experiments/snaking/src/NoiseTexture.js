import { Geom, Draw, FrameBuffer, ShaderLibs } from "alfrid";
import { random } from "./utils";

import fs from "shaders/noise.frag";

const fboSize = 1024;

export default class NoiseTexture extends FrameBuffer {
  constructor() {
    super(fboSize, fboSize);

    this.seed = random(10);
    this.draw = new Draw()
      .setMesh(Geom.bigTriangle())
      .useProgram(ShaderLibs.bigTriangleVert, fs)
      .setClearColor(0, 0, 0, 1)
      .bindFrameBuffer(this);
  }

  update() {
    this.seed += 0.01;

    this.draw.uniform("uSeed", this.seed).draw();

    return this.texture;
  }
}
