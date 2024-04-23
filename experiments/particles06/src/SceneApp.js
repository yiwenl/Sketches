import {
  GL,
  DrawBall,
  DrawCopy,
  DrawCamera,
  Scene,
  FboPingPong,
  FrameBuffer,
  CameraOrtho,
} from "alfrid";
import { targetWidth, targetHeight } from "./features";
import resize from "./utils/resize";
import { biasMatrix, toGlsl } from "./utils";
import Config from "./Config";
import Assets from "./Assets";
import Scheduler from "scheduling";

import { mat4 } from "gl-matrix";

import DrawSave from "./DrawSave";
import DrawParticles from "./DrawParticles";
import DrawSim from "./DrawSim";
import DrawDither from "./DrawDither";
import DrawFluidBg from "./DrawFluidBg";

import NoiseMap from "./NoiseMap";

// fluid simulation
import FluidSimulation from "./fluid-sim";

const BOUND = 4;
const debug = false;

class SceneApp extends Scene {
  constructor() {
    super();

    if (Config.useTargetSize) {
      GL.setSize(targetWidth, targetHeight);
      this.camera.setAspectRatio(GL.aspectRatio);
      resize(GL.canvas, targetWidth, targetHeight);
    }

    this.orbitalControl.radius.value = 17;
    // this.orbitalControl.lock();

    // fluid
    const DISSIPATION = 0.99;
    this._fluid = new FluidSimulation({
      DENSITY_DISSIPATION: DISSIPATION,
      VELOCITY_DISSIPATION: DISSIPATION,
      PRESSURE_DISSIPATION: DISSIPATION,
    });
  }

  _init() {
    this.resize();

    // light
    // this._light = [1.5, 5, 3.5];
    const z = 3;
    this._light = [2, 5, z];

    const r = 3;
    this._cameraLight = new CameraOrtho();
    this._cameraLight.ortho(-r, r, r, -r, 1, 10);
    this._cameraLight.lookAt(this._light, [0, 0, z - 1.5]);

    this.mtxShadow = mat4.create();
    mat4.mul(
      this.mtxShadow,
      this._cameraLight.projection,
      this._cameraLight.view
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
    this._fbo = new FboPingPong(num, num, oSettings, 4);
    this._fboPos = new FrameBuffer(num, num, oSettings);
    this._fboRender = new FrameBuffer(GL.width, GL.height, {
      wrapS: GL.MIRRORED_REPEAT,
      wrapT: GL.MIRRORED_REPEAT,
    });

    const fboSize = 2048;
    this._fboShadow = new FrameBuffer(fboSize, fboSize);

    this._noiseVelocity = new NoiseMap();
    this._noiseDensity = new NoiseMap(512, true);
  }

  _initViews() {
    this._dCopy = new DrawCopy();
    this._dBall = new DrawBall();
    this._dCamera = new DrawCamera();

    this._drawParticles = new DrawParticles();
    this._drawSim = new DrawSim();
    this._drawDither = new DrawDither();
    this._drawFluidBg = new DrawFluidBg(BOUND);

    new DrawSave()
      .bindFrameBuffer(this._fbo.read)
      .setClearColor(0, 0, 0, 1)
      .draw();

    this._fboPos.bind();
    GL.clear(0, 0, 0, 1);
    this._dCopy.draw(this._fbo.read.getTexture(0));
    this._fboPos.unbind();
  }

  _updateFluid() {
    const { sin, cos } = Math;
    let t = Scheduler.getElapsedTime() * 0.25;
    let ns = cos(sin(t) * 1.7) * 1.5 + 1.5;
    // ns = 1;
    // if (Math.random() < 0.1) console.log(ns);
    this._noiseVelocity.noiseScale = ns;
    this._noiseDensity.noiseScale = ns;

    // update noise map
    this._noiseVelocity.update();
    this._noiseDensity.update();

    this._fluid.updateFlowWithMap(
      this._noiseVelocity.texture,
      this._noiseDensity.texture,
      0.5
    );

    this._fluid.update();
  }

  update() {
    this._updateFluid();

    // update particle
    this._drawSim
      .bindFrameBuffer(this._fbo.write)
      .bindTexture("uPosMap", this._fbo.read.getTexture(0), 0)
      .bindTexture("uVelMap", this._fbo.read.getTexture(1), 1)
      .bindTexture("uExtraMap", this._fbo.read.getTexture(2), 2)
      .bindTexture("uDataMap", this._fbo.read.getTexture(3), 3)
      .bindTexture("uPosOrgMap", this._fboPos.texture, 4)
      .bindTexture("uFluidMap", this._fluid.velocity, 5)
      .bindTexture("uDensityMap", this._fluid.density, 6)
      .uniform("uBound", BOUND)
      .uniform("uTime", Scheduler.getElapsedTime())
      .draw();

    this._fbo.swap();

    // update shadow map
    this._fboShadow.bind();
    GL.clear(1, 1, 1, 1);
    GL.setMatrices(this._cameraLight);
    this._renderParticles(false);
    this._fboShadow.unbind();
  }

  _renderParticles(mShadow = false) {
    const tDepth = mShadow
      ? this._fboShadow.depthTexture
      : this._fboPos.texture;

    const viewport = mShadow
      ? [GL.width, GL.height]
      : [this._fboShadow.width, this._fboShadow.height];

    this._drawParticles
      .bindTexture("uMap", Assets.get("particle"), 0)
      .bindTexture("uPosMap", this._fbo.read.getTexture(0), 1)
      .bindTexture("uDataMap", this._fbo.read.getTexture(3), 2)
      .bindTexture("uDepthMap", tDepth, 3)
      .uniform("uViewport", viewport)
      .uniform("uShadowMatrix", "mat4", this.mtxShadow)
      .uniform("uLight", this._light)
      .draw();
  }

  render() {
    let g = 0.1;
    const bgColor = Config.colorBg.map(toGlsl);
    GL.clear(...bgColor, 1);
    GL.setMatrices(this.camera);

    this._fboRender.bind();
    GL.clear(...bgColor, 1);

    GL.disable(GL.DEPTH_TEST);
    // this._drawFluidBg.bindTexture("uMap", this._fluid.density, 0).draw();
    GL.enable(GL.DEPTH_TEST);

    this._renderParticles(true);
    this._fboRender.unbind();

    // this._dCopy.draw(this._fboRender.texture);
    this._drawDither
      .bindTexture("uMap", this._fboRender.texture, 0)
      .uniform("uTime", Scheduler.getElapsedTime())
      .uniform("uRatio", GL.aspectRatio)
      .uniform("uColor", bgColor)
      .draw();

    // debugging
    if (debug) {
      this._dCamera.draw(this._cameraLight, [1, 0.5, 0]);
      const r = BOUND;
      this._dBall.draw([-r, -r, 0], [g, g, g], [1, 0, 0]);
      this._dBall.draw([r, -r, 0], [g, g, g], [1, 0, 0]);
      this._dBall.draw([r, r, 0], [g, g, g], [1, 0, 0]);
      this._dBall.draw([-r, r, 0], [g, g, g], [1, 0, 0]);

      g = 200;
      GL.viewport(0, 0, g, g);
      this._dCopy.draw(this._fluid.velocity);
      GL.viewport(g, 0, g, g);
      this._dCopy.draw(this._fluid.density);
    }
  }

  resize() {
    if (!GL.useTargetSize) {
      const { innerWidth, innerHeight } = window;
      const pixelRatio = 1.5;
      GL.setSize(innerWidth * pixelRatio, innerHeight * pixelRatio);
      this.camera?.setAspectRatio(GL.aspectRatio);
    }
    this._fboRender = new FrameBuffer(GL.width, GL.height, {
      wrapS: GL.MIRRORED_REPEAT,
      wrapT: GL.MIRRORED_REPEAT,
    });
    console.log(GL.aspectRatio, 9 / 16);
  }
}

export default SceneApp;
