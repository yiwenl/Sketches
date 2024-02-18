import {
  GL,
  DrawBall,
  DrawAxis,
  DrawCopy,
  DrawCamera,
  Scene,
  FboPingPong,
  FrameBuffer,
  CameraOrtho,
} from "alfrid";
import { targetWidth, targetHeight } from "./features";
import resize from "./utils/resize";
import { random, toGlsl, biasMatrix } from "./utils";
import Config from "./Config";
import DrawSave from "./DrawSave";
import DrawRender from "./DrawRender";
import DrawSim from "./DrawSim";
import DrawPlane from "./DrawPlane";
import { mat4 } from "gl-matrix";

import Scheduler from "scheduling";

// fluid simulation
import FluidSimulation from "./fluid-sim";

import NoiseMap from "./utils/NoiseMap";
import Assets from "./Assets";

class SceneApp extends Scene {
  constructor() {
    super();

    if (Config.useTargetSize) {
      GL.setSize(targetWidth, targetHeight);
      this.camera.setAspectRatio(GL.aspectRatio);
      resize(GL.canvas, targetWidth, targetHeight);
    }

    // this.orbitalControl.lock();
    this.orbitalControl.radius.setTo(16);

    // fluid
    const DISSIPATION = 0.97;
    this._fluid = new FluidSimulation({
      DENSITY_DISSIPATION: DISSIPATION,
      VELOCITY_DISSIPATION: DISSIPATION,
      PRESSURE_DISSIPATION: DISSIPATION,
    });
  }

  _init() {
    this.resize();

    // shadow
    this.cameraLight = new CameraOrtho();
    this._lightPos = [5, 8, 6];
    const r = 5;
    const ratio = 0.6;
    this.cameraLight.ortho(-r * ratio, r * ratio, r, -r, 4, 15);
    this.cameraLight.lookAt(this._lightPos, [0, 0, 0]);

    this.mtxShadow = mat4.create();
    mat4.mul(
      this.mtxShadow,
      this.cameraLight.projection,
      this.cameraLight.view
    );
    mat4.mul(this.mtxShadow, biasMatrix, this.mtxShadow);
  }

  _initTextures() {
    const oSettings = {
      type: GL.FLOAT,
      minFilter: GL.NEAREST,
      magFilter: GL.NEAREST,
    };

    const { numParticles: num } = Config;
    this._fbo = new FboPingPong(num, num, oSettings, 5);
    this._fboPos = new FrameBuffer(num, num, oSettings);

    const fboSize = 1024;
    this._fboShadow = new FrameBuffer(fboSize, fboSize, {
      minFilter: GL.LINEAR,
      magFilter: GL.LINEAR,
      type: GL.UNSIGNED_BYTE,
    });

    // noise map
    this._noiseVelocity = new NoiseMap();
    this._noiseDensity = new NoiseMap(true, true);
  }

  _initViews() {
    this._dAxis = new DrawAxis();
    this._dCopy = new DrawCopy();
    this._dBall = new DrawBall();
    this._dCamera = new DrawCamera();

    // init particles
    this._drawSave = new DrawSave()
      .setClearColor(0, 0, 0, 0)
      .bindFrameBuffer(this._fbo.read)
      .draw();

    this._fboPos.bind();
    GL.clear(0, 0, 0, 1);
    this._dCopy.draw(this._fbo.read.getTexture(0));
    this._fboPos.unbind();

    this._drawPlane = new DrawPlane();
    this._drawRender = new DrawRender();
    this._drawSim = new DrawSim();
  }

  update() {
    this._drawSim
      .bindFrameBuffer(this._fbo.write)
      .bindTexture("uPosMap", this._fbo.read.getTexture(0), 0)
      .bindTexture("uVelMap", this._fbo.read.getTexture(1), 1)
      .bindTexture("uExtraMap", this._fbo.read.getTexture(2), 2)
      .bindTexture("uDataMap", this._fbo.read.getTexture(3), 3)
      .bindTexture("uColorMap", this._fbo.read.getTexture(4), 4)
      .bindTexture("uFluidMap", this._fluid.velocity, 5)
      .bindTexture("uDensityMap", this._fluid.density, 6)
      .bindTexture("uPosOrgMap", this._fboPos.texture, 6)
      .uniform("uBound", this._drawSave.bound)
      .uniform("uTime", Scheduler.getElapsedTime())
      .draw();

    this._fbo.swap();

    this._fluid.updateFlowWithMap(
      this._noiseVelocity.texture,
      this._noiseDensity.texture,
      random(0.3, 0.2)
    );
    this._fluid.update();

    // update shadow map
    this._fboShadow.bind();
    GL.clear(0, 0, 0, 0);
    GL.setMatrices(this.cameraLight);
    this._renderParticles(false);
    this._fboShadow.unbind();

    this._noiseDensity.update();
    this._noiseVelocity.update();
  }

  _renderParticles(mShadow) {
    const tDepth = mShadow
      ? this._fboShadow.depthTexture
      : this._fboPos.texture;

    const draw = this._drawPlane;

    draw
      .bindTexture("uPosMap", this._fbo.read.getTexture(0), 0)
      .bindTexture("uVelMap", this._fbo.read.getTexture(1), 1)
      .bindTexture("uDataMap", this._fbo.read.getTexture(3), 2)
      .bindTexture("uColorMap", this._fbo.read.getTexture(4), 3)
      .bindTexture("uDepthMap", tDepth, 4)
      .bindTexture("uStrokeMap", Assets.get("strokes"), 5)
      .uniform("uShadowMatrix", this.mtxShadow)
      .uniform("uViewport", [GL.width, GL.height])
      .uniform("uParticleScale", Config.particleScale * mShadow ? 1 : 2)
      .draw();
  }

  render() {
    let g = 0.8;
    GL.clear(...Config.colorBg.map(toGlsl), 1);
    GL.clear(g, g, g * 0.95, 1);
    GL.setMatrices(this.camera);

    // this._dCamera.draw(this.cameraLight, [1, 0.5, 0]);
    this._renderParticles(true);
  }

  resize() {
    if (!GL.useTargetSize) {
      const { innerWidth, innerHeight } = window;
      const pixelRatio = 1.5;
      GL.setSize(innerWidth * pixelRatio, innerHeight * pixelRatio);
      this.camera?.setAspectRatio(GL.aspectRatio);
    }

    console.log(GL.aspectRatio, 9 / 16);
  }
}

export default SceneApp;
