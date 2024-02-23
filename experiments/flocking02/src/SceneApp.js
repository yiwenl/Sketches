import {
  GL,
  DrawBall,
  DrawAxis,
  DrawCopy,
  DrawCamera,
  CameraOrtho,
  Scene,
  FboPingPong,
  FrameBuffer,
} from "alfrid";
import { RAD, random, getMonoColor, biasMatrix } from "./utils";
import Config from "./Config";
import { mat4 } from "gl-matrix";
import Scheduler from "scheduling";

// draw calls
import DrawSim from "./DrawSim";
import DrawSave from "./DrawSave";
import DrawRender from "./DrawRender";
import DrawRibbon from "./DrawRibbon";

let hasSaved = false;
let canSave = false;

// flocking settings
const maxRadius = 20;
const radius = 2.2;
const separationThreshold = 0.3;

const numSets = 48;

class SceneApp extends Scene {
  constructor() {
    super();
    // GL.setSize(targetWidth, targetHeight);
    // this.camera.setAspectRatio(GL.aspectRatio);
    // resize(GL.canvas, targetWidth, targetHeight);

    this.camera.setPerspective(80 * RAD, GL.aspectRatio, 1, 1000);

    // shadow
    this.light = [1, 25, 1];
    this.cameraLight = new CameraOrtho();
    const s = 23;
    this.cameraLight.ortho(-s, s, s, -s, 3, 47);
    this.cameraLight.lookAt(this.light, [0, 0, 0]);

    this.mtxShadow = mat4.create();
    mat4.mul(
      this.mtxShadow,
      this.cameraLight.projection,
      this.cameraLight.view
    );
    mat4.mul(this.mtxShadow, biasMatrix, this.mtxShadow);

    // this.orbitalControl.lock();
    this.orbitalControl.radius.setTo(25);
    this.orbitalControl.rx.value = -0.4;
    this.seed = random(10);
    this.time = random(100);

    const { numParticles: num } = Config;
    this._fboPos.bind();
    GL.clear(0, 0, 0, 0);
    for (let j = 0; j < numSets; j++) {
      for (let i = 0; i < numSets; i++) {
        const tx = i * num;
        const ty = j * num;
        GL.viewport(tx, ty, num, num);
        this._dCopy.draw(this._fbo.read.getTexture(0));
      }
    }
    this._fboPos.unbind();

    let numSim = 2048;
    while (numSim--) {
      this.simulate();
    }

    setTimeout(() => {
      canSave = true;
    }, 500);
  }

  _initTextures() {
    this.resize();
    const { numParticles: num } = Config;
    const oSettings = {
      minFilter: GL.NEAREST,
      magFilter: GL.NEAREST,
      type: GL.FLOAT,
    };
    this._fbo = new FboPingPong(num, num, oSettings, 4);

    // position sprite sheet
    this._index = 0;
    const size = num * numSets;
    console.log("size", size);
    this._fboPos = new FrameBuffer(size, size, oSettings);

    // shadow
    const fboSize = 2048;
    this._fboShadow = new FrameBuffer(fboSize, fboSize, {
      minFilter: GL.LINEAR,
      magFilter: GL.LINEAR,
    });
  }

  _initViews() {
    this._dAxis = new DrawAxis();
    this._dCopy = new DrawCopy();
    this._dBall = new DrawBall();
    this._dCamera = new DrawCamera();

    new DrawSave()
      .setClearColor(0, 0, 0, 1)
      .bindFrameBuffer(this._fbo.read)
      .draw();

    this._drawRender = new DrawRender();
    this._drawSim = new DrawSim();

    const numLines = Config.numParticles;
    this._drawRibbon = new DrawRibbon(numLines, numSets);
  }

  update() {
    this.orbitalControl.ry.value += 0.002;
    this.simulate();

    // update shadow map
    this._fboShadow.bind();
    GL.clear(0, 0, 0, 0);
    GL.setMatrices(this.cameraLight);
    this._renderRibbon(false);
    this._fboShadow.unbind();
  }

  simulate() {
    this.time += 0.01;
    const { numParticles: num } = Config;
    this._drawSim
      .bindFrameBuffer(this._fbo.write)
      .bindTexture("uPosMap", this._fbo.read.getTexture(0), 0)
      .bindTexture("uVelMap", this._fbo.read.getTexture(1), 1)
      .bindTexture("uExtraMap", this._fbo.read.getTexture(2), 2)
      .bindTexture("uDataMap", this._fbo.read.getTexture(3), 3)
      // .uniform("uTime", Scheduler.getElapsedTime() + this.seed)
      .uniform("uTime", this.time)
      .uniform("uNum", parseInt(num))
      .uniform("uRadius", radius)
      .uniform("uMaxRadius", maxRadius)
      .uniform("uSeparationThreshold", separationThreshold)
      .draw();

    this._fbo.swap();

    this._updateRibbonPosMap();
  }

  _updateRibbonPosMap() {
    const { numParticles: num } = Config;
    const tx = this._index % numSets;
    const ty = Math.floor(this._index / numSets);
    this._index++;

    if (this._index >= numSets * numSets) {
      this._index = 0;
    }

    GL.disable(GL.DEPTH_TEST);
    this._fboPos.bind();
    // GL.clear(1, 0, 0, 1);
    GL.viewport(tx * num, ty * num, num, num);
    // this._dCopy.draw(this._fbo.read.getTexture(0));
    this._dCopy.draw(this._fbo.read.texture);
    this._fboPos.unbind();
    GL.enable(GL.DEPTH_TEST);
  }

  _renderRibbon(mShadow) {
    const tDepth = mShadow
      ? this._fboShadow.depthTexture
      : this._fbo.read.getTexture(0);

    this._drawRibbon
      .bindTexture("uPosMap", this._fboPos.texture, 0)
      .bindTexture("uDepthMap", tDepth, 1)
      .uniform("uShadowMatrix", this.mtxShadow)
      .uniform("uIndex", this._index)
      .uniform("uColor", getMonoColor(0.8))
      .uniform("uLight", this.light)
      .draw();
  }

  render() {
    let g = 0.1;
    GL.clear(...getMonoColor(g), 1);
    GL.setMatrices(this.camera);
    // this._dCamera.draw(this.cameraLight, [1, 0.5, 0]);

    this._renderRibbon(true);

    this._drawRender
      .bindTexture("uPosMap", this._fbo.read.getTexture(0), 0)
      .uniform("uViewport", [GL.width, GL.height])

      .draw();
  }

  resize() {
    if (!GL.useTargetSize) {
      const { innerWidth, innerHeight } = window;
      const pixelRatio = 2;
      GL.setSize(innerWidth * pixelRatio, innerHeight * pixelRatio);
      this.camera?.setAspectRatio(GL.aspectRatio);
    }

    // console.log(GL.aspectRatio, 9 / 16);
  }
}

export default SceneApp;
