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
import { iOS, random, toGlsl, biasMatrix } from "./utils";
import { vec3, mat4 } from "gl-matrix";
import Config from "./Config";
import DrawRibbon from "./DrawRibbon";
import DrawShadow from "./DrawShadow";
import DrawFace from "./DrawFace";
import DrawAdjust from "./DrawAdjust";

import FaceDetection, {
  videoWidth,
  videoHeight,
  FACE_DETECTED,
  FACE_LOST,
  VIDEO_STARTED,
} from "./FaceDetection";

// fluid simulation
import FluidSimulation from "./fluid-sim";

// particle simulation
import ParticleSystem from "./ParticleSystem";

import NoiseMap from "./utils/NoiseMap";
import Assets from "./Assets";

const numSets = 24;
const faceMeshScale = 0.03;

class SceneApp extends Scene {
  constructor() {
    super();

    if (Config.useTargetSize) {
      GL.setSize(targetWidth, targetHeight);
      this.camera.setAspectRatio(GL.aspectRatio);
      resize(GL.canvas, targetWidth, targetHeight);
    }

    // this.orbitalControl.lock();
    this.orbitalControl.radius.setTo(10);

    // fluid
    const DISSIPATION = 0.97;
    this._fluid = new FluidSimulation({
      DENSITY_DISSIPATION: DISSIPATION,
      VELOCITY_DISSIPATION: DISSIPATION,
      PRESSURE_DISSIPATION: DISSIPATION,
    });

    let num = numSets * numSets;
    while (num--) {
      this.update(false);
    }
  }

  _init() {
    this.resize();

    // face detection
    this._dir = [0, 0, 5];
    this._pointNose = [0, 0, 0];
    this._pointCenter = [0, 0, 0];

    let r = 3;
    this._cameraFront = new CameraOrtho();
    this._cameraFront.ortho(-r, r, r, -r, 4, 8);
    this._cameraFront.lookAt([0, 0, 10], [0, 0, 0]);

    this._hasFaceDetected = false;
    FaceDetection.on(FACE_DETECTED, (mFace) => this.onFaceDetected(mFace));
    FaceDetection.on(VIDEO_STARTED, () => this.onVideoStarted());
    FaceDetection.init();
    FaceDetection.on(FACE_LOST, () => {
      // this._offsetOpen.value = 0;
    });

    // shadow
    this.cameraLight = new CameraOrtho();
    this._lightPos = [5, 8, 6];
    r = 5.5;
    const ratio = 0.7;
    this.cameraLight.ortho(-r * ratio, r * ratio, r, -r, 5, 20);
    this.cameraLight.lookAt(this._lightPos, [0, 0, 0]);

    this.mtxShadow = mat4.create();
    mat4.mul(
      this.mtxShadow,
      this.cameraLight.projection,
      this.cameraLight.view
    );
    mat4.mul(this.mtxShadow, biasMatrix, this.mtxShadow);
  }

  onVideoStarted() {
    // FaceDetection.video.style.zIndex = 0;
    FaceDetection.video.style.opacity = 0.85;
    const t = 2;
    FaceDetection.video.style.width = `${640 / t}px`;
    FaceDetection.video.style.height = `${480 / t}px`;
    // this._textureVideo = new GLTexture(FaceDetection.video);
  }

  onFaceDetected(mFace) {
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

    this._hasFaceDetected = true;
  }

  _initTextures() {
    let fboSize = 1024;
    this._fboShadow = new FrameBuffer(fboSize, fboSize, {
      minFilter: GL.LINEAR,
      magFilter: GL.LINEAR,
      type: GL.UNSIGNED_BYTE,
    });

    // noise map
    this._noiseVelocity = new NoiseMap();
    this._noiseDensity = new NoiseMap(true, true);

    // white texture
    const fbo = new FrameBuffer(4, 4);
    fbo.bind();
    GL.clear(1, 1, 1, 1);
    fbo.unbind();
    this._textureWhite = fbo.texture;

    const type = iOS ? GL.HALF_FLOAT : GL.FLOAT;
    const oSettings = {
      minFilter: GL.LINEAR,
      magFilter: GL.LINEAR,
      type,
    };
    fboSize = 1024;
    this._fboFront = new FrameBuffer(fboSize, fboSize, oSettings, 2);
    this._fboFront.bind();
    GL.clear(0, 0, 0, 0);
    this._fboFront.unbind();
  }

  _initViews() {
    this._dAxis = new DrawAxis();
    this._dCopy = new DrawCopy();
    this._dBall = new DrawBall();
    this._dCamera = new DrawCamera();
    this._drawFace = new DrawFace();
    this._drawAdjust = new DrawAdjust();

    this._drawShadow = new DrawShadow();

    // particles
    let num = 32;
    this._systemRibbon = new ParticleSystem(num);
    this._drawRibbon = new DrawRibbon(num, numSets);

    // position
    const oSettings = {
      type: GL.FLOAT,
      minFilter: GL.NEAREST,
      magFilter: GL.NEAREST,
    };

    const size = numSets * num;
    console.log("Size : ", size);
    this._fboPosRibbon = new FboPingPong(size, size, oSettings);
    this._index = 0;
  }

  update(mUpdateShadow = true) {
    this._fluid.updateFlowWithMap(
      this._noiseVelocity.texture,
      this._noiseDensity.texture,
      random(0.3, 0.2)
    );
    this._fluid.update();

    this._systemRibbon.update(
      this._fluid.velocity,
      this._fluid.density,
      this._fboFront.getTexture(0)
    );

    // update ribbon map
    this._updateRibbonPosMap();

    this._noiseDensity.update();
    this._noiseVelocity.update();

    if (mUpdateShadow) {
      // update shadow map
      this._fboShadow.bind();
      GL.clear(0, 0, 0, 0);
      GL.setMatrices(this.cameraLight);
      this._renderParticles(false);
      this._fboShadow.unbind();
    }

    GL.enable(GL.DEPTH_TEST);
    this._fboFront.bind();
    GL.clear(0, 0, 0, 0);
    GL.setMatrices(this._cameraFront);
    GL.setModelMatrix(mat4.create());
    this._drawFace.draw();
    this._fboFront.unbind();
  }

  _updateRibbonPosMap() {
    const tx = this._index % numSets;
    const ty = Math.floor(this._index / numSets);
    this._index++;

    if (this._index >= numSets * numSets) {
      this._index = 0;
    }

    const { fbo } = this._systemRibbon;
    const num = this._systemRibbon.numParticles;

    GL.disable(GL.DEPTH_TEST);
    this._fboPosRibbon.read.bind();
    GL.viewport(tx * num, ty * num, num, num);
    this._dCopy.draw(fbo.getTexture(0));
    this._fboPosRibbon.read.unbind();

    this._fboPosRibbon.write.bind();
    GL.clear(0, 0, 0, 0);
    this._drawAdjust
      .bindTexture("uMap", this._fboPosRibbon.read.texture, 0)
      .bindTexture("uFaceMap", this._fboFront.getTexture(0), 1)
      .uniform("uBound", 4)
      .draw();
    GL.enable(GL.DEPTH_TEST);

    this._fboPosRibbon.swap();
  }

  _renderParticles(mShadow) {
    const tDepth = mShadow ? this._fboShadow.depthTexture : this._textureWhite;

    this._drawRibbon
      .bindTexture("uPosMap", this._fboPosRibbon.read.texture, 0)
      .bindTexture("uDepthMap", tDepth, 1)
      .bindTexture("uColorMap", Assets.get("rippling"), 2)
      .bindTexture("uFaceMap", this._fboFront.getTexture(0), 3)
      .uniform("uBound", 4)
      .uniform("uIndex", this._index)
      .uniform("uLight", this._lightPos)
      .uniform("uShadowMatrix", this.mtxShadow)
      .uniform("uLengthOffset", 1)
      .draw();
  }

  render() {
    let g = 0.8;
    GL.clear(...Config.colorBg.map(toGlsl), 1);
    // GL.clear(g, g, g * 0.95, 1);
    GL.setMatrices(this.camera);

    // this._dCamera.draw(this.cameraLight, [1, 0.5, 0]);
    this._renderParticles(true);

    this._drawShadow
      .bindTexture("uDepthMap", this._fboShadow.depthTexture, 0)
      .uniform("uShadowMatrix", this.mtxShadow)
      .draw();

    g = 1;
    GL.viewport(0, 0, g, g);
    this._dCopy.draw(this._fboFront.getTexture(0));
    GL.viewport(g, 0, g, g);
    this._dCopy.draw(this._fboFront.getTexture(1));
    // this._dCopy.draw(this._fboPosRibbon.texture);
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
