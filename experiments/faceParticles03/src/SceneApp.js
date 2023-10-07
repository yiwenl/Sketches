import {
  GL,
  DrawBall,
  DrawAxis,
  DrawCopy,
  DrawCamera,
  Scene,
  CameraOrtho,
  FboPingPong,
  FrameBuffer,
} from "alfrid";
import {
  RAD,
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

// fluid simulation
import FluidSimulation from "./fluid-sim";

import generateBg from "./generateBg";

const faceMeshScale = 0.03;
const FLUID_BOUND = 4;

let hasSaved = false;
let canSave = false;

class SceneApp extends Scene {
  constructor() {
    super();

    this.frame = 0;

    this.orbitalControl.lock();
    this.orbitalControl.radius.value = 20;
    this.camera.setPerspective(33 * RAD, GL.aspectRatio, 0.1, 40);

    this._pointNose = [0, 0, 0];
    this._pointCenter = [0, 0, 0];

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
    FaceDetection.init();
    FaceDetection.on(FACE_DETECTED, this.onFaceDetected);

    const pointIndices = [4, 159, 386, 200, 47, 176];
    let num = 15;
    while (num--) {
      pointIndices.push(randomInt(467));
    }

    this._controlPoints = pointIndices.map((index) => new ControlPoint(index));

    setTimeout(() => {
      canSave = true;
    }, 500);
  }

  _setupLight() {
    const r = 6;
    this._lightPos = [0, 5, 2];
    this._cameraLight = new CameraOrtho();
    this._cameraLight.ortho(-r, r, r, -r, 2, 9);
    this._cameraLight.lookAt(this._lightPos, [0, 0, 0]);

    this._mtxShadow = mat4.clone(this._cameraLight.matrix);
    mat4.mul(this._mtxShadow, biasMatrix, this._mtxShadow);
  }

  updateBg() {
    this._textureBg = generateBg();
  }

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

    // ribbon
    let numRibbons = 11;
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

    // particles
    new DrawSave().bindFrameBuffer(this._fbo.read).draw();
    this._drawParticles = new DrawParticles();
    this._drawFloating = new DrawFloatingParticles();
    this._drawSim = new DrawSim();
    this._drawRibbon = new DrawRibbon();
  }

  update() {
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
      // .uniform("uCameraMatrix", this.camera.matrix)
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

    const { colorHighlight, colorShadow } = Config;

    const tDepth = mShadow ? this._fboShadow.depthTexture : this._fluid.density;
    this._drawParticles
      .uniform("uViewport", [GL.width, GL.height])
      .bindTexture("uPosMap", this._fbo.read.getTexture(0), 0)
      .bindTexture("uVelMap", this._fbo.read.getTexture(1), 1)
      .bindTexture("uDataMap", this._fbo.read.getTexture(3), 2)
      .bindTexture("uDepthMap", tDepth, 3)
      .uniform("uShadowMatrix", this._mtxShadow)
      .uniform("uColorHighlight", colorHighlight.map(toGlsl))
      .uniform("uColorShadow", colorShadow.map(toGlsl))
      .draw();
  }

  _renderRibbons() {
    GL.disable(GL.CULL_FACE);
    this._fboRibbons.forEach(({ texture }, i) => {
      this._drawRibbon.bindTexture(`uPosMap${i}`, texture, i);
    });
    this._drawRibbon.draw();
    GL.enable(GL.CULL_FACE);
  }

  render() {
    const { colorHighlight, colorShadow } = Config;
    const debug = false;
    let g = 1;
    GL.clear(0, 0, 0, 1);
    GL.setMatrices(this.camera);

    GL.disable(GL.DEPTH_TEST);
    this._dCopy.draw(this._textureBg);
    GL.enable(GL.DEPTH_TEST);

    if (debug) {
      this._dAxis.draw();
      this._dCamera.draw(this._cameraFront);
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

    this._drawFloating
      .uniform("uColor0", colorHighlight.map(toGlsl))
      .uniform("uColor1", colorShadow.map(toGlsl))
      .uniform("uViewport", [GL.width, GL.height])
      .draw();

    this._renderRibbons();

    if (canSave && !hasSaved && Config.autoSave) {
      saveImage(GL.canvas, getDateString());
      hasSaved = true;
    }
  }

  resize() {
    const { innerWidth, innerHeight } = window;
    const pixelRatio = 1;
    GL.setSize(innerWidth * pixelRatio, innerHeight * pixelRatio);
    this.camera.setAspectRatio(GL.aspectRatio);
    this._textureBg = generateBg();
  }
}

export default SceneApp;
