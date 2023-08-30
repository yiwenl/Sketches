// const alfrid = require("alfrid");
import { GL, FboPingPong, FrameBuffer, Geom, ShaderLibs, Draw } from "alfrid";
import Scheduler from "scheduling";
const defaultSettings = require("./defaultSettings");

// shaders
import fsAdvect from "./shaders/advect.frag";
import fsDivergence from "./shaders/divergence.frag";
import fsClear from "./shaders/clear.frag";
import fsJacobi from "./shaders/jacobi.frag";
import fsGradientSub from "./shaders/gradientSubstract.frag";
import fsSplat from "./shaders/splat.frag";
import fsAdd from "./shaders/add.frag";

import { iOS } from "../utils";

class FluidSimulation {
  constructor(mSettings = {}) {
    this.settings = { ...defaultSettings };
    for (let s in mSettings) {
      if (this.settings[s]) {
        this.settings[s] = mSettings[s];
      }
    }

    this._initTextures();
    this._initDrawCalls();
  }

  _initTextures() {
    const { TEXTURE_SIZE: size } = this.settings;
    this._texelSize = [1 / size, 1 / size];

    const type = iOS ? GL.HALF_FLOAT : GL.FLOAT;

    const oSettings = {
      minFilter: GL.LINEAR,
      magFilter: GL.LINEAR,
      wrapS: GL.MIRRORED_REPEAT,
      wrapT: GL.MIRRORED_REPEAT,
      type,
    };

    this._fboVelocity = new FboPingPong(size, size, oSettings);
    this._fboDensity = new FboPingPong(size, size, oSettings);
    this._fboPressure = new FboPingPong(size, size, oSettings);
    this._fboDivergence = new FrameBuffer(size, size, oSettings);

    this._fboVelocity.read.bind();
    this._fboVelocity.read.unbind();
    this._fboVelocity.write.bind();
    this._fboVelocity.write.unbind();

    this._fboDensity.read.bind();
    this._fboDensity.read.unbind();
    this._fboDensity.write.bind();
    this._fboDensity.write.unbind();

    this._fboPressure.read.bind();
    this._fboPressure.read.unbind();
    this._fboPressure.write.bind();
    this._fboPressure.write.unbind();

    this._fboDivergence.bind();
    this._fboDivergence.unbind();
  }

  _initDrawCalls() {
    const mesh = Geom.bigTriangle();
    const vs = ShaderLibs.bigTriangleVert;

    //	draw calls
    this._drawAdvect = new Draw()
      .useProgram(vs, fsAdvect)
      .setMesh(mesh)
      .setClearColor(0, 0, 0, 1)
      // .uniform("uTimestep", "float", 0.0005)
      .uniform("uTimestep", "float", 0.0005)
      .uniform("uTexelSize", "vec2", this._texelSize);

    this._drawDivergence = new Draw()
      .useProgram(vs, fsDivergence)
      .setMesh(mesh)
      .setClearColor(0, 0, 0, 1)
      .bindFrameBuffer(this._fboDivergence)
      .uniform("uTexelSize", "vec2", this._texelSize);

    this._drawClear = new Draw()
      .useProgram(vs, fsClear)
      .setMesh(mesh)
      .setClearColor(0, 0, 0, 1)
      .uniform("uDissipation", "float", this.settings.PRESSURE_DISSIPATION);

    this._drawJacobi = new Draw()
      .useProgram(vs, fsJacobi)
      .setMesh(mesh)
      .setClearColor(0, 0, 0, 1)
      .uniform("uTexelSize", "vec2", this._texelSize);

    this._drawGradient = new Draw()
      .useProgram(vs, fsGradientSub)
      .setMesh(mesh)
      .setClearColor(0, 0, 0, 1)
      .uniform("uTexelSize", "vec2", this._texelSize);

    this._drawSplat = new Draw().useProgram(vs, fsSplat).setMesh(mesh);
    this._drawAdd = new Draw().useProgram(vs, fsAdd).setMesh(mesh);
  }

  updateFlow(mPos, mDir, mStrength = 1, mRadius = 1, mNoiseStrength = 0) {
    const radius = 0.05;
    const strength = 500 * mStrength;
    const time = Scheduler.getElapsedTime() * 2.0;

    this._drawSplat
      .bindFrameBuffer(this._fboVelocity.write)
      .uniform("uTime", "float", time)
      .uniform("uCenter", "vec2", mPos)
      .uniform("uRadius", "float", radius * mRadius)
      .uniform("uStrength", "float", strength)
      .uniform("uNoiseStrength", "float", mNoiseStrength)
      .uniform("uIsVelocity", "float", 1.0)
      .uniform("uDir", "vec2", mDir)
      .uniformTexture("texture", this._fboVelocity.read.texture, 0)
      .draw();
    this._fboVelocity.swap();

    this._drawSplat
      .bindFrameBuffer(this._fboDensity.write)
      .uniform("uCenter", "vec2", mPos)
      .uniform("uIsVelocity", "float", 0.0)
      .uniform("uStrength", "float", 0.05)
      .uniform("uNoiseStrength", "float", mNoiseStrength)
      .uniform("uDir", "vec2", mDir)
      .uniformTexture("texture", this._fboDensity.read.texture, 0)
      .draw();
    this._fboDensity.swap();
  }

  updateFlowWithMap(mTextureVel, mTextureDensity, uStrength = 1) {
    this._drawAdd
      .bindFrameBuffer(this._fboVelocity.write)
      .uniformTexture("textureBase", this._fboVelocity.read.texture, 0)
      .uniformTexture("textureAdd", mTextureVel, 1)
      .uniform("uStrength", "float", uStrength * 1000)
      .draw();
    this._fboVelocity.swap();

    this._drawAdd
      .bindFrameBuffer(this._fboDensity.write)
      .uniformTexture("textureBase", this._fboDensity.read.texture, 0)
      .uniformTexture("textureAdd", mTextureDensity, 1)
      .uniform("uStrength", "float", 0.02)
      .draw();
    this._fboDensity.swap();
  }

  advect(target, textureX, dissipation) {
    this._drawAdvect
      .bindFrameBuffer(target)
      .uniformTexture("textureVel", this._fboVelocity.read.texture, 0)
      .uniformTexture("textureMap", textureX, 1)
      .uniform("uDissipation", "float", dissipation)
      .draw();
  }

  update() {
    //	advect - velocity
    this.advect(
      this._fboVelocity.write,
      this._fboVelocity.read.texture,
      this.settings.VELOCITY_DISSIPATION
    );
    this._fboVelocity.swap();

    //	advect - density
    this.advect(
      this._fboDensity.write,
      this._fboDensity.read.texture,
      this.settings.DENSITY_DISSIPATION
    );
    this._fboDensity.swap();

    //	divergence
    this._drawDivergence
      .uniformTexture("textureVel", this._fboVelocity.read.texture, 0)
      .draw();

    //	clear
    this._drawClear
      .bindFrameBuffer(this._fboPressure.write)
      .uniformTexture("texturePressure", this._fboPressure.read.texture, 0)
      .draw();
    this._fboPressure.swap();

    //	jacobi
    for (let i = 0; i < this.settings.PRESSURE_ITERATIONS; i++) {
      this._drawJacobi
        .bindFrameBuffer(this._fboPressure.write)
        .uniformTexture("texturePressure", this._fboPressure.read.texture, 0)
        .uniformTexture("textureDivergence", this._fboDivergence.texture, 1)
        .draw();

      this._fboPressure.swap();
    }

    //	gradient sub
    this._drawGradient
      .bindFrameBuffer(this._fboVelocity.write)
      .uniformTexture("texturePressure", this._fboPressure.read.texture, 0)
      .uniformTexture("textureVel", this._fboVelocity.read.texture, 1)
      .draw();

    this._fboVelocity.swap();
  }

  get velocity() {
    return this._fboVelocity.read.texture;
  }

  get density() {
    return this._fboDensity.read.texture;
  }

  get divergence() {
    return this._fboDivergence.texture;
  }

  get pressure() {
    return this._fboPressure.read.texture;
  }

  get allTextures() {
    return [this.velocity, this.density, this.divergence, this.pressure];
  }

  log() {
    console.log("Fluid Settings : ");
    for (let s in this.settings) {
      console.log(s, this.settings[s]);
    }
  }
}

export default FluidSimulation;
