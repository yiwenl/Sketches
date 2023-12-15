import { GL, FboPingPong, Geom, Draw, ShaderLibs } from "alfrid";

import DrawChars from "./DrawChars";
import { random } from "./utils";
import Config from "./Config";
import fsBlur from "shaders/blur.frag";
import fsThreshold from "shaders/threshold.frag";
import fsScratch from "shaders/scratch.frag";
import fsHalftone from "shaders/halftone.frag";

let meshTri;

/**
 * Represents a layer of characters rendered based on a density map.
 * @class
 * @default
 */
export default class CharsLayer {
  constructor(mColor, mOffset = [0, 0], mBlurred = false) {
    this._isBlurred = mBlurred;
    this._blurAmount = random(1.0, 2.5);

    if (this._isBlurred) {
      console.log("Blur amount", this._blurAmount);
    }

    // fbos
    this._fbo = new FboPingPong(GL.width, GL.height);

    // draw calls
    if (!meshTri) {
      meshTri = Geom.bigTriangle();
    }
    this._drawChars = new DrawChars(14)
      .setClearColor(0, 0, 0, 0)
      .uniform("uColor", mColor)
      .uniform("uOffset", mOffset);

    this._drawBlur = new Draw()
      .setMesh(meshTri)
      .useProgram(ShaderLibs.bigTriangleVert, fsBlur)
      .setClearColor(0, 0, 0, 0);

    this._drawThreshold = new Draw()
      .setMesh(meshTri)
      .useProgram(ShaderLibs.bigTriangleVert, fsThreshold)
      .setClearColor(0, 0, 0, 0);

    this._drawScratch = new Draw()
      .setMesh(meshTri)
      .useProgram(ShaderLibs.bigTriangleVert, fsScratch)
      .setClearColor(0, 0, 0, 0)
      .uniform("uSeed", random(1000))
      .uniform("uRatio", GL.width / GL.height)
      .uniform("uThreshold", this._isBlurred ? 0.25 : 0.35);

    this._drawHalftone = new Draw()
      .setMesh(meshTri)
      .useProgram(ShaderLibs.bigTriangleVert, fsHalftone)
      .setClearColor(0, 0, 0, 0);
  }

  /**
   * Applies a blur effect to the current layer using a multi-pass algorithm and then applies a threshold effect.
   * @function
   * @name applyBlur
   * @memberof CharsLayer
   * @instance
   * @returns {void}
   */
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

  render(mDensityMap, mCharMap) {
    const { numLevel } = Config;

    // render char map to fbo
    this._drawChars
      .bindFrameBuffer(this._fbo.read)
      .bindTexture("uMap", mDensityMap, 0)
      .bindTexture("uCharMap", mCharMap, 1)
      .uniform("uNumChars", numLevel)
      .draw();

    if (this._isBlurred) {
      this.applyBlur();
    }

    // apply half tone
    // this._drawHalftone
    //   .bindFrameBuffer(this._fbo.write)
    //   .bindTexture("uMap", this._fbo.read.texture, 0)
    //   .uniform("uRatio", GL.aspectRatio)
    //   .draw();
    // this._fbo.swap();

    // apply scratch
    this._drawScratch
      .bindFrameBuffer(this._fbo.write)
      .bindTexture("uMap", this._fbo.read.texture, 0)
      .draw();

    this._fbo.swap();
  }

  get texture() {
    return this._fbo.read.texture;
  }

  get num() {
    return this._drawChars.num;
  }
}
