import {
  GL,
  DrawBall,
  DrawAxis,
  DrawCopy,
  DrawCamera,
  CameraOrtho,
  Scene,
  FrameBuffer,
} from "alfrid";
import { targetWidth, targetHeight } from "./features";
import resize from "./utils/resize";
import { toGlsl, biasMatrix, saveImage, getDateString } from "./utils";
import Config from "./Config";
import { mat4 } from "gl-matrix";
import Scheduler from "scheduling";

import DrawCube from "./DrawCube";

let hasSaved = false;
let canSave = false;

class SceneApp extends Scene {
  constructor() {
    super();

    if (Config.useTargetSize) {
      GL.setSize(targetWidth, targetHeight);
      this.camera.setAspectRatio(GL.aspectRatio);
      resize(GL.canvas, targetWidth, targetHeight);
    }

    // this.orbitalControl.lock();

    setTimeout(() => {
      canSave = true;
    }, 500);
  }

  _init() {
    this.resize();
    // GL.enable(GL.DEPTH_TEST);

    // shadow
    this.cameraLight = new CameraOrtho();

    const r = 4;
    this.lightPos = [1, 6, 1];
    this.cameraLight.ortho(-r, r, r, -r, 2, 9);
    this.cameraLight.lookAt(this.lightPos, [0, 0, 0]);

    this.mtxShadow = mat4.create();
    mat4.mul(
      this.mtxShadow,
      this.cameraLight.projection,
      this.cameraLight.view
    );
    mat4.mul(this.mtxShadow, biasMatrix, this.mtxShadow);
  }

  _initTextures() {
    const fboSize = 2048;
    this._fboShadow = new FrameBuffer(fboSize, fboSize, {
      minFilter: GL.LINEAR,
      magFilter: GL.LINEAR,
    });

    const fbo = new FrameBuffer(1, 1);
    fbo.bind();
    GL.clear(1, 1, 1, 1);
    fbo.unbind();
    this._textureWhite = fbo.texture;
  }

  _initViews() {
    this._dAxis = new DrawAxis();
    this._dCopy = new DrawCopy();
    this._dBall = new DrawBall();
    this._dCamera = new DrawCamera();

    this._drawCube = new DrawCube();
  }

  update() {
    // update shadow map

    this._fboShadow.bind();
    GL.clear(0, 1, 1, 1);
    GL.setMatrices(this.cameraLight);
    this._renderCube(false);
    this._fboShadow.unbind();
  }

  _renderCube(mShadow) {
    const tDepth = mShadow ? this._fboShadow.depthTexture : this._textureWhite;
    this._drawCube
      .bindTexture("uDepthMap", tDepth, 0)
      .uniform("uViewport", [GL.width, GL.height])
      .uniform("uShadowMatrix", this.mtxShadow)
      .uniform("uTime", Scheduler.getElapsedTime())
      .draw();
  }

  render() {
    let g = 0.1;
    GL.clear(...Config.colorBg.map(toGlsl), 1);
    GL.setMatrices(this.camera);

    this._renderCube(true);

    if (canSave && !hasSaved && Config.autoSave) {
      saveImage(GL.canvas, getDateString());
      hasSaved = true;
    }
  }

  resize() {
    if (!GL.useTargetSize) {
      const { innerWidth, innerHeight } = window;
      const pixelRatio = 1.5;
      GL.setSize(innerWidth * pixelRatio, innerHeight * pixelRatio);
      this.camera?.setAspectRatio(GL.aspectRatio);
    }
  }
}

export default SceneApp;
