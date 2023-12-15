import { GL, FboPingPong, Geom, Draw, ShaderLibs } from "alfrid";
import DrawChar from "./DrawChar";
import DrawColumn from "./DrawColumn";
import Config from "./Config";
import Scheduler from "scheduling";

import { random } from "./utils";

import fsBlur from "shaders/blur.frag";
import fsThreshold from "shaders/threshold.frag";
import fsScratch from "shaders/scratch.frag";

let meshTri;

export default class Layer {
  constructor(
    mColor,
    mOffset = [0, 0],
    mScale = 1,
    mBlurred = false,
    mIsColumn = false
  ) {
    this.color = mColor;
    this.offset = mOffset;
    this._isBlurred = mBlurred;
    this._blurAmount = random(4, 6);
    const { numLevel } = Config;
    this._fbo = new FboPingPong(GL.width, GL.height);

    // draw calls
    this._draw = mIsColumn ? new DrawColumn(mScale) : new DrawChar(mScale);

    this._draw
      .setClearColor(0, 0, 0, 0)
      .uniform("uColor", mColor)
      .uniform("uOffset", mOffset)
      .uniform("uNumChars", numLevel);

    // draw calls
    if (!meshTri) {
      meshTri = Geom.bigTriangle();
    }

    this._drawBlur = new Draw()
      .setMesh(meshTri)
      .useProgram(ShaderLibs.bigTriangleVert, fsBlur)
      .setClearColor(0, 0, 0, 0);

    this._drawThreshold = new Draw()
      .setMesh(meshTri)
      .useProgram(ShaderLibs.bigTriangleVert, fsThreshold)
      .setClearColor(0, 0, 0, 0)
      .uniform("uThreshold", 0.5);

    this._drawScratch = new Draw()
      .setMesh(meshTri)
      .useProgram(ShaderLibs.bigTriangleVert, fsScratch)
      .setClearColor(0, 0, 0, 0)
      .uniform("uSeed", random(1000))
      .uniform("uRatio", GL.width / GL.height)
      .uniform("uThreshold", this._isBlurred ? 0.25 : 0.35);
  }

  applyBlur() {
    const { width, height } = this._fbo.read;
    const numPasses = 3;
    const mBlur = this._blurAmount;
    const mThreshold = 0.15;
    // apply blur
    for (let i = 0; i < numPasses; i++) {
      const mul = (1 / Math.pow(2, i)) * mBlur;

      this._drawBlur
        .bindFrameBuffer(this._fbo.write)
        .bindTexture("uMap", this._fbo.read.texture, 0)
        .uniform("uResolution", [width * mul, height * mul])
        .uniform("uDirection", [1, 0])
        .draw();

      this._fbo.swap();

      this._drawBlur
        .bindFrameBuffer(this._fbo.write)
        .bindTexture("uMap", this._fbo.read.texture, 0)
        .uniform("uResolution", [width * mul, height * mul])
        .uniform("uDirection", [0, 1])
        .draw();

      this._fbo.swap();
    }

    // apply threshold
    this._drawThreshold
      .bindFrameBuffer(this._fbo.write)
      .bindTexture("uMap", this._fbo.read.texture, 0)
      .uniform("uThreshold", mThreshold)
      .draw();

    this._fbo.swap();
  }

  applyScratch() {
    this._drawScratch
      .bindFrameBuffer(this._fbo.write)
      .bindTexture("uMap", this._fbo.read.texture, 0)
      .draw();

    this._fbo.swap();
  }

  render(mMap, mCharMap) {
    this._draw
      .bindFrameBuffer(this._fbo.read)
      .bindTexture("uMap", mMap, 0)
      .bindTexture("uCharMap", mCharMap, 1)
      .uniform("uTime", Scheduler.getElapsedTime())
      .draw();

    if (this._isBlurred) {
      this.applyBlur();
    }

    // apply scratch
    this.applyScratch();
  }

  get texture() {
    return this._fbo.read.texture;
  }

  resize() {
    this._fbo = new FboPingPong(GL.width, GL.height);
  }
}
