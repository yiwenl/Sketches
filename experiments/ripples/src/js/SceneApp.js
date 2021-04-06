import {
  GL,
  Scene,
  Draw,
  Geom,
  DrawAxis,
  DrawDotsPlane,
  DrawCopy,
  DrawBall,
  DrawCamera,
  FboPingPong,
  FrameBuffer,
  CameraOrtho,
} from "alfrid";
import Config from "./Config";
import Assets from "./Assets";
import { resize, getColorTexture, biasMatrix, map, clamp } from "./utils";
import Scheduler from "scheduling";
import { random } from "randomutils";
import { vec2, vec3, mat4 } from "gl-matrix";
import HitTestor from "./HitTestor";

// fluid simulation
import FluidSimulation from "./fluid-sim";

// draw calls
import DrawSave from "./DrawSave";
import DrawRender from "./DrawRender";

// shaders
import vsPass from "shaders/pass.vert";
import fsSim from "shaders/sim.frag";
import vs from "shaders/basic.vert";
import fs from "shaders/diffuse.frag";

import vsPlane from "shaders/plane.vert";
import fsPlane from "shaders/plane.frag";

class SceneApp extends Scene {
  constructor() {
    super();

    // camera
    this.orbitalControl.rx.easing = 0.05;
    this.orbitalControl.rx.setTo(0.1);
    this.orbitalControl.rx.value = Math.PI / 2;
    this.orbitalControl.rx.limit(0.1, Math.PI / 2 - 0.1);
    this.orbitalControl.radius.setTo(14);
    this.orbitalControl.radius.limit(5, 15);
    if (GL.isMobile) {
      this.orbitalControl.lock();
    }

    // shadow map
    this._light = vec3.fromValues(0, 2, -7);
    this._cameraLight = new CameraOrtho();
    let r = 7;
    let rr = 5;
    this._cameraLight.ortho(-r, r, rr, -rr, 1, 15);
    this._cameraLight.lookAt(this._light, [0, 0, 0]);

    // particle texture
    this._cameraParticle = new CameraOrtho();
    r = 1;
    this._cameraParticle.ortho(-r, r, r, -r, 1, 10);
    this._cameraParticle.lookAt([0, 3, 0.1], [0, 0, 0]);

    this._mtxShadow = mat4.create();
    mat4.mul(
      this._mtxShadow,
      this._cameraLight.projection,
      this._cameraLight.view
    );
    mat4.mul(this._mtxShadow, biasMatrix, this._mtxShadow);

    // fluid
    this._fluid = new FluidSimulation({
      DENSITY_DISSIPATION: 0.92,
      VELOCITY_DISSIPATION: 0.95,
      PRESSURE_DISSIPATION: 0.9,
    });

    // states
    this._started = true;
    this._isChanging = false;

    setTimeout(() => {
      this._started = true;
    }, 3000);

    // set size
    this.resize();
  }

  _initTextures() {
    const { numParticles: num } = Config;
    const oSettings = {
      type: GL.FLOAT,
      minFilter: GL.NEAREST,
      magFilter: GL.NEAREST,
      mipmap: false,
    };
    this._fbo = new FboPingPong(num, num, oSettings, 4);
    this._fboPos = new FrameBuffer(num, num, oSettings);

    // shadow map
    const fboSize = 2048;
    this._fboShadow = new FrameBuffer(fboSize, fboSize);

    const particleTexSize = 64;
    this._fboParticle = new FrameBuffer(particleTexSize, particleTexSize);

    this._fboParticle.bind();
    this._fboParticle.unbind();

    this._textureWhite = getColorTexture([1, 0, 0]);
  }

  _initViews() {
    this._dAxis = new DrawAxis();
    this._dDots = new DrawDotsPlane();
    this._dCopy = new DrawCopy();
    this._dBall = new DrawBall();
    this._dCamera = new DrawCamera();

    this._drawRender = new DrawRender().uniform("uMapSize", [
      this._fboShadow.width,
      this._fboShadow.height,
    ]);

    this._drawSim = new Draw()
      .setMesh(Geom.bigTriangle())
      .useProgram(vsPass, fsSim)
      .setClearColor(0, 0, 0, 1);

    new DrawSave()
      .bindFrameBuffer(this._fbo.read)
      .setClearColor(0, 0, 0, 1)
      .draw();

    this._fboPos.bind();
    GL.clear(0, 0, 0, 1);
    this._dCopy.draw(this._fbo.read.getTexture(0), 0);
    this._fboPos.unbind();

    // particle
    this._drawParticle = new Draw()
      .setMesh(Geom.sphere(1.05, 24))
      .useProgram(vs, fs)
      .setClearColor(0, 0, 0, 0)
      .bindFrameBuffer(this._fboParticle);

    const s = 14;
    const mesh = Geom.plane(s, s, 1, "xz");
    this._drawPlane = new Draw().setMesh(mesh).useProgram(vsPlane, fsPlane);

    // console.log("HitTestor", HitTestor, this._drawPlane.mesh);
    this._detector = new HitTestor(mesh, this.camera);
    this._hitOrg = vec3.create();
    this._hit = vec2.fromValues(0.5, 0.5);
    this._preHit = vec2.fromValues(0.5, 0.5);

    const { planeScale } = Config;

    this._detector.on("onHit", ({ hit }) => {
      vec3.copy(this._hitOrg, hit);
      let x = map(hit[0], -planeScale, planeScale, 0, 1);
      let y = map(hit[2], -planeScale, planeScale, 0, 1);
      this._hit = [x, y];
    });
  }

  update() {
    // camera angle
    if (Config.cameraMovement) {
      const t = Scheduler.getElapsedTime() * 0.4;
      this.orbitalControl.rx.value = (Math.sin(t) * 0.5 + 0.5) * 0.2 + 0.4;
      this.orbitalControl.ry.value += 0.01;
    }

    const { pow, sin, cos, PI } = Math;
    // update fluid
    const time = Scheduler.getElapsedTime() * 0.5;
    let f = sin(cos(time * 10.5) * 2.32 + sin(-time * 5.0)) * 0.5 + 0.5;
    if (f > 0.98 && !this._isChanging) {
      Config.colorIndex++;
      if (Config.colorIndex > 9) {
        Config.colorIndex = 0;
      }
      this._isChanging = true;
      setTimeout(() => {
        this._isChanging = false;
      }, 300);
    }
    f = pow(f, 4.0);
    f = 0.5 + f * 4.0;
    let noise = 0.5;

    if (!this._started) {
      f = 0.05;
      noise = 0.1;
    }

    const num = 8;
    let a, x, y, dx, dy, r;

    r = 0.2;
    let tr = 0.95;
    const aOffset = random(PI * 8.0);

    let radius = random(1, 3);

    for (let i = 0; i < num; i++) {
      a = (i / num) * Math.PI * 2.0 + random(-tr, tr) + aOffset;
      x = Math.cos(a) * r + 0.5;
      y = Math.sin(a) * r + 0.5;

      dx = Math.cos(a);
      dy = Math.sin(a);
      this._fluid.updateFlow([x, y], [dx, dy], (1 / num) * f, radius, noise);
    }

    // update fluid with touch
    radius = 2.5;
    const dir = vec2.create();
    vec2.sub(dir, this._hit, this._preHit);
    f = vec2.length(dir);
    vec2.normalize(dir, dir);
    this._fluid.updateFlow(this._hit, dir, f * 20.0, radius, noise);

    vec2.copy(this._preHit, this._hit);

    this._fluid.update();

    // update particle position
    this._drawSim
      .bindFrameBuffer(this._fbo.write)
      .bindTexture("uPosMap", this._fbo.read.getTexture(0), 0)
      .bindTexture("uVelMap", this._fbo.read.getTexture(1), 1)
      .bindTexture("uExtraMap", this._fbo.read.getTexture(2), 2)
      .bindTexture("uDataMap", this._fbo.read.getTexture(3), 3)
      .bindTexture("uDensityMap", this._fluid.density, 4)
      .bindTexture("uFluidMap", this._fluid.velocity, 5)
      .bindTexture("uPosOrgMap", this._fboPos.getTexture(0), 6)
      .uniform("uTime", Scheduler.getElapsedTime())
      .uniform("uNoiseStrength", this._started ? Config.noiseStrength : 0)
      .uniform("uPlaneSize", Config.planeScale)
      .draw();

    this._fbo.swap();

    // update shadow map
    this._fboShadow.bind();
    GL.clear(1, 0, 0, 1);
    GL.setMatrices(this._cameraLight);
    this.renderParticles(false);
    this._fboShadow.unbind();
  }

  renderParticles(mWithShadow) {
    const tDpeth = mWithShadow
      ? this._fboShadow.depthTexture
      : this._textureWhite;

    const time = Scheduler.getElapsedTime();

    // console.log(this._fboParticle.texture, this._fboParticle.getTexture(0));
    this._drawRender
      .bindTexture("uPosMap", this._fbo.read.getTexture(0), 0)
      .bindTexture("uDepthMap", tDpeth, 1)
      .bindTexture("uDataMap", this._fbo.read.getTexture(3), 3)
      .bindTexture("uParticleMap", this._fboParticle.texture, 4)
      .bindTexture("uColorMap", Assets.get(`00${Config.colorIndex}`), 5)
      .bindTexture("uDisplacementMap", Assets.get(`displacement`), 6)
      .uniform("uShadowMatrix", this._mtxShadow)
      .uniform("uPlaneSize", Config.planeScale)
      .uniform("uTime", Scheduler.getElapsedTime() * 0.2)
      .uniform("uOffset", [Math.sin(time * 1.2), Math.cos(time * 2.1)])
      .uniform("uParticleScale", Config.particleScale)
      .uniform("uViewport", [GL.width, GL.height])
      .draw();

    GL.setMatrices(this._cameraParticle);
    this._drawParticle.uniform("uLight", this._light).draw();
  }

  render() {
    let s;
    const bg = Config.bgColor.map((v) => v / 255);
    GL.clear(bg[0], bg[1], bg[2], 1);

    this._drawPlane
      .bindTexture("uDepthMap", this._fboShadow.depthTexture, 0)
      .uniform("uShadowMatrix", this._mtxShadow)
      .uniform("uColor", bg)
      .draw();

    s = 0.1;
    Config.debug && this._dCamera.draw(this._cameraLight, [0.95, 0.95, 0.5]);
    Config.debug && this._dBall.draw(this._light, [s, s, s], [1, 1, 0]);
    Config.debug && this._dBall.draw(this._hitOrg, [s, s, s], [1, 1, 0]);

    this.renderParticles(true);

    // debug
    if (Config.debug) {
      s = 128;
      GL.viewport(0, 0, s, s);
      this._dCopy.draw(this._fboShadow.depthTexture);
      GL.viewport(s, 0, s, s);
      this._dCopy.draw(this._fluid.density);
      GL.viewport(s * 2, 0, s, s);
      this._dCopy.draw(this._fluid.velocity);
      GL.viewport(s * 3, 0, s, s);
      this._dCopy.draw(this._fboPos.texture);
      GL.viewport(s * 4, 0, s, s);
      this._dCopy.draw(this._fboParticle.texture);
    }
  }

  resize() {
    const pixelRatio = 1;
    const { innerWidth, innerHeight } = window;
    resize(innerWidth * pixelRatio, innerHeight * pixelRatio);
    this.camera.setAspectRatio(GL.aspectRatio);
  }
}

export default SceneApp;
