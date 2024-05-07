import {
  GL,
  DrawBall,
  DrawCamera,
  DrawCopy,
  Scene,
  Geom,
  HitTestor,
  FrameBuffer,
  FboPingPong,
  CameraOrtho,
} from "alfrid";
import { targetWidth, targetHeight } from "./features";
import resize from "./utils/resize";
import { mix, RAD, toGlsl, smoothstep, biasMatrix } from "./utils";
import Config from "./Config";
import { vec2, mat4 } from "gl-matrix";

import TrackPoint3D from "./TrackPoint3D";

// Face Detection
import FaceDetection, { FACE_DETECTED } from "./FaceDetection";

// fluid simulation
import FluidSimulation from "./fluid-sim";

// draw calls
import DrawHitTestArea from "./DrawHitTestArea";
import DrawParticles from "./DrawParticles";
import DrawSave from "./DrawSave";
import DrawSim from "./DrawSim";
import DrawSpheres from "./DrawSpheres";
import DrawBg from "./DrawBg";
import DrawFace from "./DrawFace";
import combineMaps from "./combineMaps";

class SceneApp extends Scene {
  constructor() {
    super();

    if (Config.useTargetSize) {
      GL.setSize(targetWidth, targetHeight);
      this.camera.setAspectRatio(GL.aspectRatio);
      resize(GL.canvas, targetWidth, targetHeight);
    }

    this.orbitalControl.update();
    // this.orbitalControl.lock();
    // this.orbitalControl.radius.setTo(20);

    this.camera.setPerspective(60 * RAD, GL.aspectRatio, 0.1, 100);

    // hit testor
    const s = 15;
    const mesh = Geom.plane(s, s, 1);
    this._hitTestor = new HitTestor(mesh, this.camera, [GL.width, GL.height]);

    this._drawHitTestArea = new DrawHitTestArea(mesh)
      .bindFrameBuffer(this._fboMap)
      .setClearColor(0, 0, 0, 1);

    // mouse
    this._mouse = new TrackPoint3D();
    this._hitTestor.on("onHit", (e) => {
      this._mouse.update(e.hit);
      const { pos, dir, speed } = this._mouse;
      // console.log(pos, dir, speed);
      let _pos = [pos[0], pos[1]];
      let _dir = [dir[0], dir[1]];
      vec2.normalize(_dir, _dir);

      _pos = _pos.map((v) => v / s + 0.5);
      let f = smoothstep(0.0, 0.1, speed);
      const radius = mix(0.5, 3, f);
      const strength = mix(2, 5, f);

      this._fluid.updateFlow(_pos, _dir, radius, strength, 1);
    });

    // light
    this._light = [5, 8, 5];
    this._cameraLight = new CameraOrtho();
    const r = 8;
    this._cameraLight.ortho(-r, r, r, -r, 3, 28);
    this._cameraLight.lookAt(this._light, [0, 0, 0]);

    this.mtxShadow = mat4.create();
    mat4.mul(
      this.mtxShadow,
      this._cameraLight.projection,
      this._cameraLight.view
    );
    mat4.mul(this.mtxShadow, biasMatrix, this.mtxShadow);
  }

  _init() {
    this.resize();

    // fluid
    const DISSIPATION = 0.985;
    this._fluid = new FluidSimulation({
      DENSITY_DISSIPATION: DISSIPATION,
      VELOCITY_DISSIPATION: DISSIPATION,
      PRESSURE_DISSIPATION: DISSIPATION,
    });

    // face detection
    FaceDetection.init();
    FaceDetection.on(FACE_DETECTED, (o) => this._onFaceDetected(o));
    this._pointNose = new TrackPoint3D();
  }

  _onFaceDetected(mFace) {
    const { keypoints } = mFace;
    const faceMeshScale = 0.05;

    const getAdjustedPoint = (p) => {
      return [p.x - 320, -(p.y - 240), -p.z].map((v) => v * faceMeshScale);
    };

    const getAdjustedPointByIndex = (index) => {
      return getAdjustedPoint(keypoints[index]);
    };

    const noseIndex = 4;
    const pointNose = getAdjustedPointByIndex(noseIndex);
    this._pointNose.update(pointNose);
    const { pos, dir, speed } = this._pointNose;
    let f = smoothstep(0.0, 0.2, speed);
    const bound = 5;
    const _pos = [pos[0], pos[1]].map((v) => (v / bound) * 0.5 + 0.5);
    const _dir = [dir[0], dir[1]];
    vec2.normalize(_dir, _dir);

    const radius = mix(1, 8, f);
    const strength = mix(2, 8, f);

    this._fluid.updateFlow(_pos, _dir, radius, strength, 1);

    const vertices = keypoints.map(getAdjustedPoint);
    this._drawFace.update(vertices).draw();
  }

  _initTextures() {
    const { numParticles: num } = Config;

    const oSettings = {
      type: GL.FLOAT,
      minFilter: GL.NEAREST,
      magFilter: GL.NEAREST,
    };

    const oSettingsLinear = {
      minFilter: GL.LINEAR,
      magFilter: GL.LINEAR,
    };

    this._fbo = new FboPingPong(num, num, oSettings, 4);

    let fboSize = 2048;
    this._fboShadow = new FrameBuffer(fboSize, fboSize, oSettingsLinear);

    fboSize = 1024;
    this._fboFace = new FrameBuffer(fboSize, fboSize, oSettingsLinear);
    this._fboMap = new FrameBuffer(fboSize, fboSize, oSettingsLinear);

    [this._fboFace, this._fboMap].map((fbo) => {
      fbo.bind();
      GL.clear(0, 0, 0, 0);
      fbo.unbind();
    });
  }

  _initViews() {
    this._dCopy = new DrawCopy();
    this._dBall = new DrawBall();
    this._dCamera = new DrawCamera();

    const numParticles = parseInt(Config.numParticles);

    this._drawParticles = new DrawParticles();
    this._drawSpheres = new DrawSpheres();
    this._drawSim = new DrawSim().uniform("uNum", numParticles);
    this._drawBg = new DrawBg();
    this._drawFace = new DrawFace()
      .bindFrameBuffer(this._fboFace)
      .setClearColor(0, 0, 0, 1);

    // init particles
    new DrawSave().bindFrameBuffer(this._fbo.read).draw();
  }

  update() {
    // update fluid
    this._fluid.update();

    // update map
    this._drawHitTestArea.bindTexture("uMap", this._fluid.density, 0).draw();

    this._textureMap = combineMaps(this._fboMap.texture, this._fboFace.texture);

    const { pullForce, repelForce } = Config;

    // update particles
    this._drawSim
      .bindFrameBuffer(this._fbo.write)
      .bindTexture("uPosMap", this._fbo.read.getTexture(0), 0)
      .bindTexture("uVelMap", this._fbo.read.getTexture(1), 1)
      .bindTexture("uExtraMap", this._fbo.read.getTexture(2), 2)
      .bindTexture("uDataMap", this._fbo.read.getTexture(3), 3)
      // .bindTexture("uDensityMap", this._fboMap.texture, 4)
      .bindTexture("uDensityMap", this._textureMap, 4)
      .uniform("uCameraMatrix", this.camera.matrix)
      .uniform("uRatio", mix(GL.aspectRatio, 1.0, 0.25))
      .uniform("uHit", this._mouse.pos)
      .uniform("uRepelForce", repelForce)
      .uniform("uPullForce", pullForce)
      .draw();

    this._fbo.swap();

    // update shadow map
    this._fboShadow.bind();
    GL.clear(0, 0, 0, 0);
    GL.setMatrices(this._cameraLight);
    this._renderParticles(false);
    this._fboShadow.unbind();
  }

  _renderParticles(mShadow) {
    const tDepth = mShadow ? this._fboShadow.depthTexture : this._fluid.density;

    this._drawSpheres
      .uniform("uViewport", [GL.width, GL.height])
      .uniform("uShadowMatrix", this.mtxShadow)
      .bindTexture("uPosMap", this._fbo.read.getTexture(0), 0)
      .bindTexture("uDataMap", this._fbo.read.getTexture(3), 1)
      .bindTexture("uDepthMap", tDepth, 2)
      .draw();
  }

  render() {
    let g = 0.1;
    GL.clear(...Config.colorBg.map(toGlsl), 1);
    GL.setMatrices(this.camera);

    this._dCamera.draw(this._cameraLight, [1, 0.5, 0]);

    // this._drawHitTestArea.draw();

    // this._dCopy.draw(this._fboMap.texture);

    this._drawBg
      .uniform("uShadowMatrix", this.mtxShadow)
      .bindTexture("uDepthMap", this._fboShadow.depthTexture, 0)
      .draw();

    this._dBall.draw(this._light, [g, g, g], [1, 0.5, 0]);

    // this._drawParticles
    this._renderParticles(true);

    g = 300;
    GL.viewport(0, 0, g, g);
    this._dCopy.draw(this._fboShadow.depthTexture);
    GL.viewport(g, 0, g * GL.aspectRatio, g);
    this._dCopy.draw(this._fboFace.texture);
  }

  resize() {
    const { innerWidth, innerHeight } = window;
    const pixelRatio = 1.5;
    GL.setSize(innerWidth * pixelRatio, innerHeight * pixelRatio);
    this.camera?.setAspectRatio(GL.aspectRatio);
  }
}

export default SceneApp;
