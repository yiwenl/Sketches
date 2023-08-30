import {
  GL,
  Draw,
  Geom,
  Mesh,
  DrawBall,
  DrawAxis,
  DrawCopy,
  DrawCamera,
  Scene,
  FrameBuffer,
  FboPingPong,
  CameraOrtho,
} from "alfrid";
import { random, biasMatrix, saveImage, getDateString } from "./utils";
import Config from "./Config";
import { vec2, mat4 } from "gl-matrix";
import Scheduler from "scheduling";

// face detection
// import FaceDetection from "./FaceDetection";
// import { TRIANGULATION } from "./triangulation";

import DrawMask from "./DrawMask";
import DrawSave from "./DrawSave";
import DrawRender from "./DrawRender";

// fluid simulation
import FluidSimulation from "./fluid-sim";

import vs from "shaders/face.vert";
import fs from "shaders/face.frag";

import vsPass from "shaders/pass.vert";
import fsSim from "shaders/sim.frag";

let hasSaved = false;
let canSave = false;

class SceneApp extends Scene {
  constructor() {
    super();
    GL.disable(GL.CULL_FACE);
    this.camera.setAspectRatio(GL.aspectRatio);
    this.initAngle = 0;

    // const { planeSize } = Config
    // this.cameraFront = new CameraOrtho();

    // this.orbitalControl.lock();
    this.orbitalControl.radius.setTo(5);

    this._lightPos = [2, 2, 2];
    this._cameraLight = new CameraOrtho();
    const r = 1;
    this._cameraLight.ortho(-r, r, r, -r, 1.5, 5);
    this._cameraLight.lookAt(this._lightPos, [0, 0, 0]);
    this._shadowMatrix = mat4.create();
    mat4.mul(
      this._shadowMatrix,
      this._cameraLight.projection,
      this._cameraLight.view
    );

    mat4.mul(this._shadowMatrix, this._shadowMatrix, biasMatrix);

    // this._faceDetection = new FaceDetection();
    // this._faceDetection.init();
    // this._faceDetection.on("onMeshUpdate", this._meshUpdate);

    // fluid
    const DISSIPATION = 0.985;
    this._fluid = new FluidSimulation({
      DENSITY_DISSIPATION: DISSIPATION,
      VELOCITY_DISSIPATION: DISSIPATION,
      PRESSURE_DISSIPATION: DISSIPATION,
    });

    setTimeout(() => {
      canSave = true;
    }, 500);
  }

  _meshUpdate = (o) => {
    if (random() > 0.99) {
      console.log("Mesh update", o);
    }

    const { points } = o;
    if (!this._drawFace) {
      this.mesh = new Mesh().bufferVertex(points).bufferIndex(TRIANGULATION);

      this._drawFace = new Draw().setMesh(this.mesh).useProgram(vs, fs);
      // .bindFrameBuffer(this._fboDepth)
      // .setClearColor(0, 0, 0, 0);

      // this._open();
    } else {
      this.mesh.bufferVertex(points);
    }
  };

  _initTextures() {
    this.resize();

    const { numParticles: num } = Config;
    const oSettings = {
      type: GL.FLOAT,
      minFilter: GL.NEAREST,
      magFilter: GL.NEAREST,
    };
    this._fbo = new FboPingPong(num, num, oSettings, 4);

    this._fboPosOrg = new FrameBuffer(num, num, oSettings);
    this._fboFace = new FrameBuffer(GL.width, GL.height, { type: GL.FLOAT });

    const fboSize = 1024;
    this._fboShadow = new FrameBuffer(fboSize, fboSize);
  }

  _initViews() {
    this._dAxis = new DrawAxis();
    this._dCopy = new DrawCopy();
    this._dBall = new DrawBall();
    this._dCamera = new DrawCamera();

    this._drawMask = new DrawMask();
    this._drawRender = new DrawRender();

    new DrawSave()
      .bindFrameBuffer(this._fbo.read)
      .setClearColor(1, 1, 0, 1)
      .draw();

    this._fboPosOrg.bind();
    GL.clear(0, 0, 0, 1);
    this._dCopy.draw(this._fbo.read.getTexture(0));
    this._fboPosOrg.unbind();

    this._drawSim = new Draw()
      .setMesh(Geom.bigTriangle())
      .useProgram(vsPass, fsSim)
      .setClearColor(0, 0, 0, 1);
  }

  update() {
    this._fboFace.bind();
    GL.clear(0, 0, 0, 0);
    this._drawMask.draw();
    this._fboFace.unbind();

    // update fluid
    const num = 12;
    const r = 0.25;
    const center = [0.5, 0.5];
    this.initAngle += 0.01;
    for (let i = 0; i < num; i++) {
      const a = (i / num) * Math.PI * 2 + this.initAngle + random(-1, 1) * 0.4;
      const pos = [r * random(0.5, 1.0), 0];
      vec2.rotate(pos, pos, [0, 0], a);
      const dir = vec2.clone(pos);
      vec2.rotate(dir, dir, [0, 0], Math.PI * random(0.8, 1));
      vec2.add(pos, pos, center);

      this._fluid.updateFlow(pos, dir, random(0.5, 2), random(2, 3), 0.5);
    }

    this._fluid.update();

    // update particles

    this._drawSim
      .bindFrameBuffer(this._fbo.write)
      .bindTexture("uPosMap", this._fbo.read.getTexture(0), 0)
      .bindTexture("uVelMap", this._fbo.read.getTexture(1), 1)
      .bindTexture("uExtraMap", this._fbo.read.getTexture(2), 2)
      .bindTexture("uDataMap", this._fbo.read.getTexture(3), 3)
      .bindTexture("uPosOrgMap", this._fboPosOrg.texture, 4)
      .bindTexture("uFluidMap", this._fluid.velocity, 5)
      .bindTexture("uDensityMap", this._fluid.density, 6)
      .uniform("uPlaneSize", Config.planeSize)
      .uniform("uTime", Scheduler.getElapsedTime())
      .draw();

    this._fbo.swap();

    this._updateShadowMap();
  }

  _updateShadowMap() {
    this._fboShadow.bind();
    GL.clear(0, 0, 0, 1);
    GL.setMatrices(this._cameraLight);
    this._renderParticles(false);

    this._fboShadow.unbind();
  }

  _renderParticles(mShadow) {
    const tShadow = mShadow
      ? this._fboShadow.depthTexture
      : this._fboPosOrg.texture;

    this._drawRender
      .bindTexture("uPosMap", this._fbo.read.getTexture(0), 0)
      .bindTexture("uDepthMap", this._fboFace.texture, 1)
      .bindTexture("uExtraMap", this._fbo.read.getTexture(2), 2)
      .bindTexture("uDataMap", this._fbo.read.getTexture(3), 3)
      .bindTexture("uShadowMap", tShadow, 4)
      .uniform("uViewport", [GL.width, GL.height])
      .uniform("uPlaneSize", Config.planeSize)
      .uniform("uShadowMatrix", this._shadowMatrix)
      .draw();
  }

  render() {
    let g = 0.05;
    GL.clear(g, g, g, 1);
    GL.setMatrices(this.camera);

    this._dAxis.draw();
    this._dCamera.draw(this._cameraLight);

    // if (this._drawFace) {
    //   this._drawFace.draw();
    // }

    // this._drawMask.draw();

    this._renderParticles(true);

    const r = 1.1;
    this._dBall.draw([r, r, 0], [g, g, g], [1, 0, 0]);
    this._dBall.draw([-r, r, 0], [g, g, g], [1, 0, 0]);
    this._dBall.draw([-r, -r, 0], [g, g, g], [1, 0, 0]);
    this._dBall.draw([r, -r, 0], [g, g, g], [1, 0, 0]);
    this._dBall.draw(this._lightPos, [g, g, g], [1, 1, 0]);

    g = 128;
    g = 200;
    GL.viewport(0, 0, g, g / GL.aspectRatio);
    this._dCopy.draw(this._fboFace.texture);

    GL.viewport(g, 0, g, g);
    // this._dCopy.draw(this._fbo.read.getTexture(0));
    this._dCopy.draw(this._fboShadow.depthTexture);

    if (canSave && !hasSaved && Config.autoSave) {
      saveImage(GL.canvas, getDateString());
      hasSaved = true;
    }
  }

  resize() {
    GL.setSize(window.innerWidth, window.innerHeight);
    this.camera.setAspectRatio(GL.aspectRatio);
  }
}

export default SceneApp;
