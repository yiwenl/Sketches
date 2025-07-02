import {
  GL,
  DrawBall,
  DrawAxis,
  DrawCopy,
  DrawCamera,
  Scene,
  FrameBuffer,
  EaseNumber,
  CameraOrtho,
  CameraPerspective,
} from "alfrid";
import { targetWidth, targetHeight } from "./features";
import resize from "./utils/resize";
import { RAD, toGlsl, getMonoColor, biasMatrix } from "./utils";
import Config from "./Config";
import Assets from "./Assets";
import { vec3, mat4 } from "gl-matrix";

import ParticleSystem from "./ParticleSystem";
// import FluidSimulation from "./fluid-sim";

import generateNoiseMap from "./generateNoiseMap";
import generateAOMap from "./generateAOMap";
// import NoiseMap from "./NoiseMap";

// draw calls
import DrawBg from "./DrawBg";
import DrawBlocks from "./DrawBlocks";
import DrawRibbon from "./DrawRibbon";
import DrawCompose from "./DrawCompose";

class SceneApp extends Scene {
  constructor() {
    super();

    if (Config.useTargetSize) {
      GL.setSize(targetWidth, targetHeight);
      this.camera.setAspectRatio(GL.aspectRatio);
      resize(GL.canvas, targetWidth, targetHeight);
    }

    this.orbitalControl.radius.value = 7;
    this.updateCamera();
    this.orbitalControl.lock();

    this.cameraDome = new CameraPerspective();
    this.cameraDome.setPerspective(90 * RAD, GL.aspectRatio, 1, 100);

    // interactions
    const easing = 0.05;
    this.rx = new EaseNumber(Math.PI / 2, easing);
    this.ry = new EaseNumber(Math.PI / 4, easing);
    window.addEventListener("mousemove", (e) => {
      this.rx.value = (e.clientY / window.innerHeight) * Math.PI;
      this.ry.value = -(e.clientX / window.innerWidth) * Math.PI;
    });

    // light
    this._light = [1, 10, 3];
    vec3.rotateX(this._light, this._light, [0, 0, 0], 0.25);
    this._cameraLight = new CameraOrtho();
    const r = 5;
    this._cameraLight.ortho(-r, r, r, -r, 7, 15.5);
    this._cameraLight.lookAt(this._light, [0, 0, 0]);

    this.mtxShadow = mat4.create();
    mat4.multiply(
      this.mtxShadow,
      this._cameraLight.projection,
      this._cameraLight.view
    );
    mat4.multiply(this.mtxShadow, biasMatrix, this.mtxShadow);
  }

  _init() {
    this.resize();
  }

  _initTextures() {
    this._fboBg = new FrameBuffer(GL.width, GL.height);

    const fboSize = 1024 * 2;
    this._fboShadow = new FrameBuffer(fboSize, fboSize);

    this._textureNoise = generateNoiseMap();
    this._textureColor = Assets.get("color");

    this._fboRender = new FrameBuffer(GL.width, GL.height);
  }

  _initViews() {
    this._dAxis = new DrawAxis();
    this._dCopy = new DrawCopy();
    this._dBall = new DrawBall();
    this._dCamera = new DrawCamera();

    // particle systems
    const numBlocks = 128 * 4;
    const numWires = 32;
    const wireLength = 16;
    this._particleBlocks = new ParticleSystem(numBlocks);
    this._particleWires = new ParticleSystem(numWires);

    this._particles = [this._particleBlocks, this._particleWires];

    this._drawBlocks = new DrawBlocks(numBlocks);

    this._drawRibbon = new DrawRibbon(numWires, wireLength);
    this._drawRibbon.init(this._particleWires.fbo.getTexture(0));

    this._drawCompose = new DrawCompose();

    this._drawBg = new DrawBg()
      .setClearColor(0, 0, 0, 1)
      .uniform("uColor", getMonoColor(1));
  }

  updateCamera() {
    const { cameraNear, cameraFar } = Config;
    this.camera.setPerspective(90 * RAD, GL.aspectRatio, cameraNear, cameraFar);
  }

  update() {
    // copy camera position to camera dome
    this.cameraDome.lookAt(this.camera.position, [0, 0, 0]);

    // update rotation
    GL.setMatrices(this.cameraDome);
    this._drawBg.container.rotationX = this.rx.value;
    this._drawBg.container.rotationY = this.ry.value;
    this._drawBg.bindFrameBuffer(this._fboBg).draw();

    GL.setMatrices(this.camera);
    // update particles
    this._particles.forEach((p) => p.update(this._fboBg.texture));
    this._drawRibbon.update(this._particleWires.fbo.getTexture(0));

    this.updateShadowMap();
  }

  updateShadowMap() {
    GL.setMatrices(this._cameraLight);
    this._fboShadow.bind();
    GL.clear(1, 1, 1, 1);
    this.renderScene(false);
    this._fboShadow.unbind();
  }

  renderScene(mShadow) {
    const tDepth = mShadow ? this._fboShadow.depthTexture : this._fboBg.texture;

    this._drawBlocks
      .bindTexture("uPosMap", this._particleBlocks.fbo.getTexture(0), 0)
      .bindTexture("uVelMap", this._particleBlocks.fbo.getTexture(1), 1)
      .bindTexture("uDataMap", this._particleBlocks.fbo.getTexture(3), 2)
      .bindTexture("uBgMap", this._fboBg.texture, 3)
      .bindTexture("uColorMap", this._textureColor, 4)
      .bindTexture("uDepthMap", tDepth, 5)
      .uniform("uShadowMatrix", this.mtxShadow)
      .uniform("uLight", this._light)
      .draw();

    this._drawRibbon
      .bindTexture("uBgMap", this._fboBg.texture, 1)
      .bindTexture("uDepthMap", tDepth, 2)
      .bindTexture("uColorMap", this._textureColor, 3)
      .uniform("uShadowMatrix", this.mtxShadow)
      .uniform("uLight", this._light)
      .draw();
  }

  render() {
    let g = 0.1;
    GL.clear(...Config.colorBg.map(toGlsl), 1);
    GL.setMatrices(this.camera);
    this._fboRender.bind();
    GL.clear(0, 0, 0, 0);
    GL.disable(GL.DEPTH_TEST);
    this._dCopy.draw(this._fboBg.texture);
    GL.enable(GL.DEPTH_TEST);

    this.renderScene(true);

    this._fboRender.unbind();

    this._textureAO = generateAOMap(this._fboRender.depthTexture, this.camera);

    GL.disable(GL.DEPTH_TEST);
    this._drawCompose
      .bindTexture("uMap", this._fboRender.texture, 0)
      .bindTexture("uAoMap", this._textureAO, 1)
      .uniform("uAoStrength", Config.aoStrength)
      .uniform("uRatio", GL.aspectRatio)
      .draw();
    // this._dCopy.draw(this._fboRender.texture);
    // this._dCopy.draw(this._fboRender.depthTexture);
    // this._dCopy.draw(this._textureAO);
  }

  resize() {
    if (!GL.useTargetSize) {
      const { innerWidth, innerHeight } = window;
      const pixelRatio = 1.5;
      GL.setSize(innerWidth * pixelRatio, innerHeight * pixelRatio);
      this.camera?.setAspectRatio(GL.aspectRatio);

      this._fboBg = new FrameBuffer(GL.width, GL.height);
    }

    if (this._fboRender) {
      this._fboRender = new FrameBuffer(GL.width, GL.height);
    }
  }
}

export default SceneApp;
