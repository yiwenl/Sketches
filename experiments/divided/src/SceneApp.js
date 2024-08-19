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
} from "alfrid";
import { targetWidth, targetHeight } from "./features";
import resize from "./utils/resize";
import { RAD, toGlsl, getMonoColor, biasMatrix } from "./utils";
import Config from "./Config";
import DrawBg from "./DrawBg";
import { vec3, mat4 } from "gl-matrix";

import ParticleSystem from "./ParticleSystem";

import generateNoiseMap from "./generateNoiseMap";

// draw calls
import DrawBlocks from "./DrawBlocks";
import DrawRibbon from "./DrawRibbon";
import DrawDots from "./DrawDots";

class SceneApp extends Scene {
  constructor() {
    super();

    if (Config.useTargetSize) {
      GL.setSize(targetWidth, targetHeight);
      this.camera.setAspectRatio(GL.aspectRatio);
      resize(GL.canvas, targetWidth, targetHeight);
    }

    this.camera.setPerspective(90 * RAD, GL.aspectRatio, 0.1, 100);
    this.orbitalControl.radius.value = 5;
    // this.orbitalControl.lock();

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
    this._drawDots = new DrawDots(numBlocks);

    this._drawRibbon = new DrawRibbon(numWires, wireLength);
    this._drawRibbon.init(this._particleWires.fbo.getTexture(0));

    this._drawBg = new DrawBg()
      .setClearColor(0, 0, 0, 1)
      .uniform("uColor", getMonoColor(1));
  }

  update() {
    // update rotation
    this._drawBg.container.rotationX = this.rx.value;
    this._drawBg.container.rotationY = this.ry.value;
    this._drawBg.bindFrameBuffer(this._fboBg).draw();

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
      .bindTexture("uColorMap", this._fboBg.texture, 3)
      .bindTexture("uDepthMap", tDepth, 4)
      .uniform("uShadowMatrix", this.mtxShadow)
      .uniform("uLight", this._light)
      .draw();

    this._drawRibbon
      .bindTexture("uColorMap", this._fboBg.texture, 1)
      .bindTexture("uDepthMap", tDepth, 2)
      .uniform("uShadowMatrix", this.mtxShadow)
      .uniform("uLight", this._light)
      .draw();

    this._drawDots
      .bindTexture("uPosMap", this._particleBlocks.fbo.getTexture(0), 0)
      .bindTexture("uVelMap", this._particleBlocks.fbo.getTexture(1), 1)
      .bindTexture("uNoiseMap", this._textureNoise, 2)
      .uniform("uViewport", [GL.width, GL.height]);
    // .draw();
  }

  render() {
    let g = 0.1;
    GL.clear(...Config.colorBg.map(toGlsl), 1);
    GL.setMatrices(this.camera);
    GL.disable(GL.DEPTH_TEST);
    this._dCopy.draw(this._fboBg.texture);
    GL.enable(GL.DEPTH_TEST);

    // this._dAxis.draw();
    // this._dCamera.draw(this._cameraLight, [1, 0.5, 0]);
    this.renderScene(true);

    GL.disable(GL.DEPTH_TEST);
    // g = 400;
    // GL.viewport(0, 0, g, g);
    // this._dCopy.draw(this._textureNoise);
  }

  resize() {
    if (!GL.useTargetSize) {
      const { innerWidth, innerHeight } = window;
      const pixelRatio = 1;
      GL.setSize(innerWidth * pixelRatio, innerHeight * pixelRatio);
      this.camera?.setAspectRatio(GL.aspectRatio);

      this._fboBg = new FrameBuffer(GL.width, GL.height);
    }
  }
}

export default SceneApp;
