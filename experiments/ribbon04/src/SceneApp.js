import {
  GL,
  DrawBall,
  DrawAxis,
  DrawCopy,
  DrawCamera,
  Scene,
  FrameBuffer,
  FboPingPong,
  CameraOrtho,
} from "alfrid";
import { targetWidth, targetHeight } from "./features";
import resize from "./utils/resize";
import { toGlsl, biasMatrix } from "./utils";
import Config from "./Config";
import Scheduler from "scheduling";

import { vec3, mat4 } from "gl-matrix";

import DrawSave from "./DrawSave";
import DrawSim from "./DrawSim";
import DrawParticles from "./DrawParticles";
import DrawRibbon from "./DrawRibbon";

class SceneApp extends Scene {
  constructor() {
    super();

    if (Config.useTargetSize) {
      GL.setSize(targetWidth, targetHeight);
      this.camera.setAspectRatio(GL.aspectRatio);
      resize(GL.canvas, targetWidth, targetHeight);
    }

    // this.orbitalControl.lock();
    this.orbitalControl.radius.value = 15;
    this._initSpriteSheets();
  }

  _init() {
    this.resize();

    this._index = 0;

    // shadow
    this._light = [1, 10, 1];
    vec3.rotateX(this._light, this._light, [0, 0, 0], 0.2);
    this.cameraLight = new CameraOrtho();
    const r = 6;
    this.cameraLight.ortho(-r, r, r, -r, 2, 16);
    this.cameraLight.lookAt(this._light, [0, 0, 0]);

    this.mtxShadow = mat4.create();
    mat4.multiply(
      this.mtxShadow,
      this.cameraLight.projection,
      this.cameraLight.view
    );
    mat4.multiply(this.mtxShadow, biasMatrix, this.mtxShadow);
  }

  _initTextures() {
    const { numParticles: num } = Config;
    const oSettings = {
      minFilter: GL.NEAREST,
      magFilter: GL.NEAREST,
      type: GL.FLOAT,
    };

    this._fbo = new FboPingPong(num, num, oSettings, 4);
    this._fboPosOrg = new FrameBuffer(num, num, oSettings);
  }

  _initViews() {
    this._dAxis = new DrawAxis();
    this._dCopy = new DrawCopy();
    this._dBall = new DrawBall();
    this._dCamera = new DrawCamera();

    // init particles
    new DrawSave().bindFrameBuffer(this._fbo.read).draw();
    this._drawSim = new DrawSim();
    this._drawParticles = new DrawParticles();
    this._drawRibbon = new DrawRibbon();

    // save original position
    this._fboPosOrg.bind();
    GL.clear(0, 0, 0, 0);
    this._dCopy.draw(this._fbo.read.getTexture(0));
    this._fboPosOrg.unbind();
  }

  _initSpriteSheets() {
    const { numParticles: num, numSets: numSetsStr } = Config;
    const numSets = parseInt(numSetsStr);

    const oSettings = {
      minFilter: GL.NEAREST,
      magFilter: GL.NEAREST,
      type: GL.FLOAT,
    };

    // spriteheets
    let fboSize = num * numSets;
    this._fboPos = new FrameBuffer(fboSize, fboSize, oSettings);
    this._fboData = new FrameBuffer(fboSize, fboSize, oSettings);

    this._fboPos.bind();
    GL.clear(0, 0, 0, 0);
    for (let j = 0; j < numSets; j++) {
      for (let i = 0; i < numSets; i++) {
        GL.viewport(i * num, j * num, num, num);
        this._dCopy.draw(this._fbo.read.getTexture(0));
      }
    }
    this._fboPos.unbind();

    this._fboData.bind();
    GL.clear(0, 0, 0, 0);
    for (let j = 0; j < numSets; j++) {
      for (let i = 0; i < numSets; i++) {
        GL.viewport(i * num, j * num, num, num);
        this._dCopy.draw(this._fbo.read.getTexture(3));
      }
    }
    this._fboData.unbind();

    fboSize = 2048;
    this._fboShadow = new FrameBuffer(fboSize, fboSize);
  }

  update() {
    this._drawSim
      .bindFrameBuffer(this._fbo.write)
      .bindTexture("uPosMap", this._fbo.read.getTexture(0), 0)
      .bindTexture("uVelMap", this._fbo.read.getTexture(1), 1)
      .bindTexture("uExtraMap", this._fbo.read.getTexture(2), 2)
      .bindTexture("uDataMap", this._fbo.read.getTexture(3), 3)
      .bindTexture("uPosOrgMap", this._fboPosOrg.getTexture(), 4)
      .uniform("uTime", Scheduler.getElapsedTime())
      .draw();

    this._fbo.swap();

    const { numParticles: num, numSets: numSetsStr } = Config;
    const numSets = parseInt(numSetsStr);

    const tx = this._index % numSets;
    const ty = Math.floor(this._index / numSets);
    this._index++;
    if (this._index >= numSets * numSets) {
      this._index = 0;
    }

    GL.disable(GL.DEPTH_TEST);
    this._fboPos.bind();
    GL.viewport(tx * num, ty * num, num, num);
    this._dCopy.draw(this._fbo.read.getTexture(0));
    this._fboPos.unbind();

    this._fboData.bind();
    GL.viewport(tx * num, ty * num, num, num);
    this._dCopy.draw(this._fbo.read.getTexture(3));
    this._fboData.unbind();
    GL.enable(GL.DEPTH_TEST);

    this.updateShadowMap();
  }

  updateShadowMap() {
    this._fboShadow.bind();
    GL.clear(1, 1, 1, 1);
    GL.setMatrices(this.cameraLight);
    this.renderScene(false);
    this._fboShadow.unbind();
  }

  renderScene(mShadow) {
    const tDepth = mShadow
      ? this._fboShadow.depthTexture
      : this._fboPos.texture;

    this._drawRibbon
      .bindTexture("uPosMap", this._fboPos.texture, 0)
      .bindTexture("uDataMap", this._fboData.texture, 1)
      .bindTexture("uDepthMap", tDepth, 2)
      .uniform("uIndex", this._index)
      .uniform("uShadowMatrix", this.mtxShadow)
      .uniform("uLight", this._light)
      .draw();
  }

  render() {
    let g = 0.1;
    GL.clear(...Config.colorBg.map(toGlsl), 1);
    GL.setMatrices(this.camera);

    this.renderScene(true);
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
