import {
  GL,
  DrawBall,
  DrawAxis,
  DrawCopy,
  DrawCamera,
  GLTexture,
  Scene,
  CameraOrtho,
  FboPingPong,
  FrameBuffer,
  EaseNumber,
} from "alfrid";
import {
  RAD,
  random,
  randomInt,
  iOS,
  toGlsl,
  biasMatrix,
  saveImage,
  getDateString,
} from "./utils";
import Config from "./Config";
import Assets from "./Assets";

import FaceDetection, {
  videoWidth,
  videoHeight,
  FACE_DETECTED,
  FACE_LOST,
  VIDEO_STARTED,
} from "./FaceDetection";
import { vec3, mat4 } from "gl-matrix";
import Scheduler from "scheduling";

import ControlPoint from "./ControlPoint";

// draw calls
import DrawLine from "./DrawLine";
import DrawFace from "./DrawFace";

// particles
import DrawSave from "./DrawSave";
import DrawSim from "./DrawSim";
import DrawParticles from "./DrawParticles";
import DrawFloatingParticles from "./DrawFloatingParticles";
import DrawRibbon from "./DrawRibbon";
import DrawBg from "./DrawBg";
import DrawVideo from "./DrawVideo";
import DrawFloor from "./DrawFloor";
import DrawCompose from "./DrawCompose";
import DrawStaticFace from "./DrawStaticFace";
import DrawVignette from "./DrawVignette";
import DrawGlare from "./DrawGlare";
import SubParticles from "./SubParticles";

// fluid simulation
import FluidSimulation from "./fluid-sim";

import generateBg from "./generateBg";
import applyBlur from "./applyBlur";

const faceMeshScale = 0.03;
const FLUID_BOUND = 4;

let hasSaved = false;
let canSave = false;

class SceneApp extends Scene {
  constructor() {
    super();

    this.frame = 0;

    this.orbitalControl.lock();
    // this.orbitalControl.rx.value = -0.4;
    this.orbitalControl.radius.value = 7;
    this.camera.setPerspective(70 * RAD, GL.aspectRatio, 0.1, 40);
    // this.camera.setPerspective(120 * RAD, GL.aspectRatio, 0.1, 40);

    this._pointNose = [0, 0, 0];
    this._pointCenter = [0, 0, 0];
    this._pointGlare = [0, 0, 0];
    this._pointGlareTarget = [0, 0, 0];

    this._dir = [0, 0, 5];
    this._hasFaceDetected = false;

    let r = 3;
    this._cameraFront = new CameraOrtho();
    this._cameraFront.ortho(-r, r, r, -r, 4, 8);
    this._cameraFront.lookAt([0, 0, 10], [0, 0, 0]);

    this._setupLight();

    // fluid simulation
    const DISSIPATION = 0.985;
    this._fluid = new FluidSimulation({
      DENSITY_DISSIPATION: DISSIPATION,
      VELOCITY_DISSIPATION: DISSIPATION,
      PRESSURE_DISSIPATION: DISSIPATION,
    });

    // face detection
    FaceDetection.on(FACE_DETECTED, this.onFaceDetected);
    FaceDetection.on(VIDEO_STARTED, this.onVideoStarted);
    FaceDetection.init();
    FaceDetection.on(FACE_LOST, () => {
      this._offsetOpen.value = 0;
    });

    const pointIndices = [4, 159, 386, 200, 47, 176];
    let num = 15;
    while (num--) {
      pointIndices.push(randomInt(467));
    }

    this._controlPoints = pointIndices.map((index) => new ControlPoint(index));

    // state
    this._offsetOpen = new EaseNumber(0, 0.02);

    setTimeout(() => {
      canSave = true;
    }, 500);
  }

  _setupLight() {
    const r = 6;
    this._lightPos = [1, 4, 2];
    this._cameraLight = new CameraOrtho();
    this._cameraLight.ortho(-r, r, r, -r, 1, 12);
    this._cameraLight.lookAt(this._lightPos, [0, 0, 0]);

    this._mtxShadow = mat4.clone(this._cameraLight.matrix);
    mat4.mul(this._mtxShadow, biasMatrix, this._mtxShadow);
  }

  updateBg() {
    this._textureBg = generateBg();
  }

  onVideoStarted = () => {
    // FaceDetection.video.style.zIndex = 0;
    FaceDetection.video.style.opacity = 0.85;
    const t = 2;
    FaceDetection.video.style.width = `${640 / t}px`;
    FaceDetection.video.style.height = `${480 / t}px`;
    this._textureVideo = new GLTexture(FaceDetection.video);
  };

  onFaceDetected = (mFace) => {
    const { keypoints } = mFace;

    const getAdjustedPoint = (p) => {
      return [p.x - videoWidth / 2, -(p.y - videoHeight / 2), -p.z].map(
        (v) => v * faceMeshScale
      );
    };

    const getAdjustedPointByIndex = (index) => {
      return getAdjustedPoint(keypoints[index]);
    };

    // this._pointGlareTarget = getAdjustedPointByIndex(337);
    this._pointGlareTarget = getAdjustedPointByIndex(299);

    const noseIndex = 4;
    this._pointNose = getAdjustedPointByIndex(noseIndex);

    const pa = getAdjustedPointByIndex(93);
    const pb = getAdjustedPointByIndex(323);
    vec3.add(this._pointCenter, pa, pb);
    vec3.scale(this._pointCenter, this._pointCenter, 0.5);

    vec3.sub(this._dir, this._pointNose, this._pointCenter);
    vec3.normalize(this._dir, this._dir);

    const cameraMoveRange = 0.4;
    let ry = vec3.dot(this._dir, [1, 0, 0]);
    this.orbitalControl.ry.value = -ry * cameraMoveRange;

    let rx = vec3.dot(this._dir, [0, 1, 0]);
    this.orbitalControl.rx.value = rx * cameraMoveRange;

    vec3.scale(this._dir, this._dir, 5);
    vec3.add(this._dir, this._dir, this._pointNose);
    this._cameraFront.lookAt(this._dir, this._pointCenter);

    const vertices = keypoints.map(getAdjustedPoint);
    this._drawFace.update(vertices);

    // fluid
    this._controlPoints.forEach((point) => {
      point.update(keypoints);
      const { pos, dir, strength, radius } = point;
      this._fluid.updateFlow(pos, dir, strength, radius, 1);
    });

    this._hasFaceDetected = true;
    this._offsetOpen.value = 1;
  };

  _initTextures() {
    this.resize();
    const type = iOS ? GL.HALF_FLOAT : GL.FLOAT;
    const oSettings = {
      minFilter: GL.NEAREST,
      magFilter: GL.NEAREST,
      type,
    };

    const fboSize = 1024;
    this._fboFront = new FrameBuffer(fboSize, fboSize, oSettings, 2);
    this._fboFront.bind();
    GL.clear(0, 0, 0, 0);
    this._fboFront.unbind();

    // particles
    const { numParticles: num } = Config;
    this._fbo = new FboPingPong(num, num, oSettings, 5);

    // shadow
    const shadowMapSize = 2048;
    this._fboShadow = new FrameBuffer(shadowMapSize, shadowMapSize);

    // bg
    this._textureBg = generateBg();

    // render
    this._fboRender = new FrameBuffer(GL.width, GL.height);

    // ribbon
    let numRibbons = 13;
    this._fboRibbons = [];
    while (numRibbons--) {
      const fbo = new FrameBuffer(num, num, oSettings);
      fbo.bind();
      GL.clear(0, 0, 0, 0);
      fbo.unbind();
      this._fboRibbons.push(fbo);
    }
  }

  _initViews() {
    this._dAxis = new DrawAxis();
    this._dCopy = new DrawCopy();
    this._dBall = new DrawBall();
    this._dCamera = new DrawCamera();
    this._drawFace = new DrawFace();
    this._drawLine = new DrawLine();
    this._drawBg = new DrawBg();
    this._drawVideo = new DrawVideo();
    this._drawCompose = new DrawCompose().uniform("uSeed", random(10));
    this._drawVignette = new DrawVignette();
    this._drawFloor = new DrawFloor();
    this._drawGlare = new DrawGlare();

    // particles
    new DrawSave().bindFrameBuffer(this._fbo.read).draw();
    this._drawParticles = new DrawParticles();
    this._drawFloating = new DrawFloatingParticles();
    this._drawStaticFace = new DrawStaticFace();
    this._drawSim = new DrawSim();
    this._drawRibbon = new DrawRibbon();
    this._subParticles = new SubParticles();
  }

  update() {
    // update video feed
    if (this._textureVideo && Config.showWebcam) {
      this._textureVideo.updateTexture(FaceDetection.video);
    }

    if (!this._hasFaceDetected) {
      return;
    }

    this.frame++;

    // update fluid
    this._fluid.update();

    GL.enable(GL.DEPTH_TEST);
    this._fboFront.bind();
    GL.clear(0, 0, 0, 0);
    GL.setMatrices(this._cameraFront);
    this._drawFace.draw();
    this._fboFront.unbind();

    // update particle

    this._drawSim
      .bindFrameBuffer(this._fbo.write)
      .bindTexture("uPosMap", this._fbo.read.getTexture(0), 0)
      .bindTexture("uVelMap", this._fbo.read.getTexture(1), 1)
      .bindTexture("uExtraMap", this._fbo.read.getTexture(2), 2)
      .bindTexture("uDataMap", this._fbo.read.getTexture(3), 3)
      .bindTexture("uPosOrgMap", this._fbo.read.getTexture(4), 4)
      .bindTexture("uFaceMap", this._fboFront.texture, 5)
      .bindTexture("uFluidMap", this._fluid.velocity, 6)
      .bindTexture("uDensityMap", this._fluid.density, 7)
      .uniform("uTime", Scheduler.getElapsedTime())
      .uniform("uBound", FLUID_BOUND)
      .draw();

    this._fbo.swap();

    this._updateShadow();

    if (this.frame % 2 === 0) {
      const fbo = this._fboRibbons.shift();
      fbo.bind();
      GL.clear(0, 0, 0, 0);
      this._dCopy.draw(this._fbo.read.getTexture(0));
      fbo.unbind();
      this._fboRibbons.push(fbo);
    }

    this._subParticles.update(this._fluid);

    // this._staticFace.update(this._fboFront.texture, this._pointNose, this._dir);

    // update glare
    this._pointGlare = this._pointGlare.map((v, i) => {
      const target = this._pointGlareTarget[i];
      v += (target - v) * 0.1;
      return v;
    });
  }

  _updateShadow() {
    this._fboShadow.bind();
    GL.clear(0, 0, 0, 0);
    GL.setMatrices(this._cameraLight);
    this._renderParticles(false);
    this._fboShadow.unbind();
  }

  _renderParticles(mShadow = false) {
    if (!this._hasFaceDetected) {
      return;
    }

    const { particleScale } = Config;

    const tDepth = mShadow ? this._fboShadow.depthTexture : this._fluid.density;
    this._drawParticles
      .uniform("uViewport", [GL.width, GL.height])
      .bindTexture("uPosMap", this._fbo.read.getTexture(0), 0)
      .bindTexture("uVelMap", this._fbo.read.getTexture(1), 1)
      .bindTexture("uDataMap", this._fbo.read.getTexture(3), 2)
      .bindTexture("uDepthMap", tDepth, 3)
      .bindTexture("uColorMap", Assets.get("colorMap"), 4)
      .uniform("uShadowMatrix", this._mtxShadow)
      .uniform("uOffsetOpen", this._offsetOpen.value)
      .uniform("uParticleScale", particleScale)
      .draw();

    this._drawStaticFace
      .uniform("uViewport", [GL.width, GL.height])
      .bindTexture("uPosMap", this._fboFront.texture, 0)
      .bindTexture("uColorMap", Assets.get("colorMap"), 1)
      .bindTexture("uDepthMap", tDepth, 2)
      .uniform("uShadowMatrix", this._mtxShadow)
      .uniform("uTime", Scheduler.getElapsedTime())
      .uniform("uOffsetOpen", this._offsetOpen.value)
      .uniform("uParticleScale", particleScale)
      .draw();
  }

  _renderRibbons() {
    GL.disable(GL.CULL_FACE);
    this._fboRibbons.forEach(({ texture }, i) => {
      this._drawRibbon.bindTexture(`uPosMap${i}`, texture, i);
    });

    const index = this._fboRibbons.length;
    this._drawRibbon
      .bindTexture("uDataMap", this._fbo.read.getTexture(3), index)
      .bindTexture("uColorMap", Assets.get("floatingMap"), index + 1)
      .uniform("uLight", this._lightPos)
      .uniform("uCenter", this._pointNose)
      .uniform("uOffsetOpen", this._offsetOpen.value)
      .draw();
    GL.enable(GL.CULL_FACE);
  }

  render() {
    const { colorHighlight, colorShadow, postEffect } = Config;
    const debug = false;
    let g = 1;
    GL.clear(0, 0, 0, 1);
    GL.setMatrices(this.camera);

    if (postEffect) {
      this._fboRender.bind();
      GL.clear(0, 0, 0, 1);
    }

    GL.disable(GL.DEPTH_TEST);
    // this._dCopy.draw(this._textureBg);
    this._drawBg
      .bindTexture("uMap", this._textureBg, 0)
      .bindTexture("uDensityMap", this._fluid.density, 1)
      .uniform("uRatio", GL.aspectRatio)
      .uniform("uTime", Scheduler.getElapsedTime())
      .uniform("uColor0", colorHighlight.map(toGlsl))
      .uniform("uColor1", colorShadow.map(toGlsl))
      .draw();

    if (this._textureVideo && Config.showWebcam) {
      this._drawVideo
        .bindTexture("uMap", this._textureVideo, 1)
        .uniform("uRatio", GL.aspectRatio)
        .draw();
    }
    g = 4;
    GL.enable(GL.DEPTH_TEST);

    if (debug) {
      this._dAxis.draw();
      // this._dCamera.draw(this._cameraFront);
      this._dCamera.draw(this._cameraLight, [1, 0.5, 0]);

      g = 0.1;
      this._dBall.draw(this._lightPos, [g, g, g], [1, 1, 0]);

      const r = FLUID_BOUND;
      this._dBall.draw([-r, -r, 0], [g, g, g], [1, 0.5, 0]);
      this._dBall.draw([r, -r, 0], [g, g, g], [1, 0.5, 0]);
      this._dBall.draw([r, r, 0], [g, g, g], [1, 0.5, 0]);
      this._dBall.draw([-r, r, 0], [g, g, g], [1, 0.5, 0]);
    }

    this._renderParticles(true);
    this._subParticles.render();

    this._drawFloating.uniform("uViewport", [GL.width, GL.height]).draw();
    this._renderRibbons();

    if (this._fboShadow.depthTexture) {
      this._drawFloor
        .bindTexture("uDepthMap", this._fboShadow.depthTexture, 0)
        .uniform("uShadowMatrix", this._mtxShadow)
        .uniform("uColor", Config.colorBg.map(toGlsl))
        .draw();
    }

    GL.disable(GL.DEPTH_TEST);
    GL.enableAdditiveBlending();
    this._drawGlare
      .uniform("uPosition", this._pointGlare)
      .uniform("uTime", Scheduler.getElapsedTime())
      .draw();
    GL.enableAlphaBlending();

    if (!postEffect) {
      this._drawVignette
        .uniform("uColor", Config.colorBg.map(toGlsl))
        .uniform("uRatio", GL.aspectRatio)
        .draw();
    }
    GL.enable(GL.DEPTH_TEST);

    if (postEffect) {
      this._fboRender.unbind();
      this._textureBlur = applyBlur(this._fboRender.texture);
      this._drawCompose
        .bindTexture("uMap", this._fboRender.texture, 0)
        .bindTexture("uBlurMap", this._textureBlur, 1)
        .uniform("uTime", Scheduler.getElapsedTime())
        .uniform("uRatio", GL.aspectRatio)
        .draw();
    }

    if (canSave && !hasSaved && Config.autoSave) {
      saveImage(GL.canvas, getDateString());
      hasSaved = true;
    }
  }

  resize() {
    const { innerWidth, innerHeight } = window;
    const pixelRatio = 2;
    GL.setSize(innerWidth * pixelRatio, innerHeight * pixelRatio);
    this.camera.setAspectRatio(GL.aspectRatio);
    this._textureBg = generateBg();
    this._fboRender = new FrameBuffer(GL.width, GL.height);
  }
}

export default SceneApp;
