import {
  GL,
  Draw,
  Geom,
  DrawBall,
  DrawAxis,
  DrawCopy,
  DrawCamera,
  Scene,
  HitTestor,
  FrameBuffer,
  FboPingPong,
  CameraOrtho,
} from "alfrid";
import {
  mix,
  pick,
  random,
  randomInt,
  smoothstep,
  getMonocolor,
  biasMatrix,
  saveImage,
  getDateString,
} from "./utils";
import Config from "./Config";
import Assets from "./Assets";
import Scheduler from "scheduling";
import { vec2, vec3, mat4 } from "gl-matrix";

// fluid simulation
import FluidSimulation from "./fluid-sim";

// draw calls
import DrawSave from "./DrawSave";
import DrawBlocks from "./DrawBlocks";

// shaders
import vsPass from "shaders/pass.vert";
import fsSim from "shaders/sim.frag";

let hasSaved = false;
let canSave = false;
const hitPlaneSize = 6;

class SceneApp extends Scene {
  constructor() {
    super();

    // fluid
    const DISSIPATION = 0.985;
    this._fluid = new FluidSimulation({
      DENSITY_DISSIPATION: DISSIPATION,
      VELOCITY_DISSIPATION: DISSIPATION,
      PRESSURE_DISSIPATION: DISSIPATION,
    });

    // this.orbitalControl.lockRotation();
    this.orbitalControl.ry.setTo(0.7);
    this.orbitalControl.rx.setTo(-0.5);
    this.orbitalControl.radius.setTo(15);
    this.orbitalControl.radius.limit(5, 40);
    this.resize();

    this._hit = [0, 0, 0];
    this._preHit = [0, 0, 0];
    const meshHit = Geom.plane(hitPlaneSize, hitPlaneSize, 1);

    const hitTestor = new HitTestor(meshHit, this.camera);
    this.needUpdateHit = false;
    hitTestor.on("onHit", (e) => {
      vec3.copy(this._hit, e.hit);
      this.needUpdateHit = true;
    });

    // shadow
    this._cameraLight = new CameraOrtho();
    const r = 8;
    this._cameraLight.ortho(-r, r, r, -r, 1, 15);
    this._cameraLight.lookAt([0, 7, 3], [0, 0, 0]);
    this._startTime = random(100);

    this.mtxShadow = mat4.create();
    mat4.mul(
      this.mtxShadow,
      this._cameraLight.projection,
      this._cameraLight.view
    );
    mat4.mul(this.mtxShadow, biasMatrix, this.mtxShadow);

    setTimeout(() => {
      canSave = true;
    }, 500);
  }

  _initTextures() {
    this.resize();
    const oSettings = {
      type: GL.FLOAT,
      minFilter: GL.NEAREST,
      magFilter: GL.NEAREST,
    };

    const { numParticles: num } = Config;
    this._fbo = new FboPingPong(num, num, oSettings, 4);
    this._fboPos = new FrameBuffer(num, num, oSettings);

    const fboSize = 2048;
    this._fboShadow = new FrameBuffer(fboSize, fboSize);
  }

  _initViews() {
    this._dAxis = new DrawAxis();
    this._dCopy = new DrawCopy();
    this._dBall = new DrawBall();
    this._dCamera = new DrawCamera();

    // init particles
    new DrawSave()
      .setClearColor(0, 0, 0, 0)
      .bindFrameBuffer(this._fbo.read)
      .draw();

    this._fboPos.bind();
    GL.clear(0, 0, 0, 0);
    this._dCopy.draw(this._fbo.read.getTexture(0));
    this._fboPos.unbind();

    // draws
    this._drawBlocks = new DrawBlocks();
    this._drawSim = new Draw()
      .setMesh(Geom.bigTriangle())
      .useProgram(vsPass, fsSim)
      .setClearColor(0, 0, 0, 1);
  }

  update() {
    this.updateFluid();

    this._drawSim
      .bindFrameBuffer(this._fbo.write)
      .bindTexture("uPosMap", this._fbo.read.getTexture(0), 0)
      .bindTexture("uVelMap", this._fbo.read.getTexture(1), 1)
      .bindTexture("uExtraMap", this._fbo.read.getTexture(2), 2)
      .bindTexture("uDataMap", this._fbo.read.getTexture(3), 3)
      .bindTexture("uPosOrgMap", this._fboPos.texture, 4)
      .bindTexture("uFluidMap", this._fluid.velocity, 5)
      .bindTexture("uDensityMap", this._fluid.density, 6)
      .uniform("uTime", Scheduler.getElapsedTime())
      .uniform("uBound", hitPlaneSize)
      .draw();

    this._fbo.swap();

    this.updateShadowMap();
  }

  updateFluid() {
    const strength = 1;
    const noise = 1;

    let num = randomInt(6, 9);
    const time = Scheduler.getElapsedTime() * 0.5 + this._startTime;

    const t = 0.2;

    for (let i = 0; i < num; i++) {
      const radius = random(2, 3);
      let x = ((i + 0.5) / num) * 0.75;
      let y = random(t, 1 - t);
      // let y = sin((i / num) * 8.0 + time * 0.8) * 0.5 + 0.5;

      const dir = [1, 0];
      vec2.rotate(dir, dir, [0, 0], random(-1, 1) * 1.5);
      this._fluid.updateFlow([x, y], dir, strength, radius);
    }

    num = randomInt(5, 9);

    for (let i = 0; i < num; i++) {
      const radius = random(2, 1);
      let x = random(0.5);
      let y = random(t, 1 - t);
      const dir = [-1, 0];
      vec2.rotate(dir, dir, [0, 0], random(-1, 1) * 0.5);
      this._fluid.updateFlow([x, y], dir, strength * 0.5, radius);
    }

    const dir = vec3.create();
    vec3.sub(dir, this._hit, this._preHit);
    // console.log(vec3.length(dir));
    if (this.needUpdateHit && 0) {
      let x = (this._hit[0] / hitPlaneSize) * 0.5 + 0.5;
      let y = (this._hit[1] / hitPlaneSize) * 0.5 + 0.5;
      const _dir = [dir[0], dir[1]];
      vec2.normalize(_dir, dir);

      let force = smoothstep(0.0, 0.35, vec3.length(dir));
      const r = mix(2, 5, force);
      force = mix(75, 100, force);

      this._fluid.updateFlow([x, y], _dir, 100, 3, 0);
      vec3.copy(this._preHit, this._hit);
      this.needUpdateHit = false;
    }

    this._fluid.update();
  }

  updateShadowMap() {
    this._fboShadow.bind();
    GL.clear(0, 0, 0, 0);
    GL.setMatrices(this._cameraLight);
    this.renderBlocks(false);
    this._fboShadow.unbind();
  }

  renderBlocks(mShadow = false) {
    const tDepth = mShadow
      ? this._fboShadow.depthTexture
      : this._fboPos.texture;

    this._drawBlocks
      .bindTexture("uPosMap", this._fbo.read.getTexture(0), 0)
      .bindTexture("uVelMap", this._fbo.read.getTexture(1), 1)
      .bindTexture("uDataMap", this._fbo.read.getTexture(3), 2)
      .bindTexture("uDepthMap", tDepth, 3)
      .bindTexture("uColorMap", Assets.get("colorMap"), 4)
      .bindTexture("uPosOrgMap", this._fboPos.texture, 5)
      .uniform("uShadowMatrix", this.mtxShadow)
      .uniform("uBound", hitPlaneSize)
      .draw();
  }

  render() {
    let g = 0.1;
    GL.clear(...getMonocolor(g), 1);
    // GL.clear(...[38, 104, 86].map(toGlsl), 1);
    GL.disable(GL.DEPTH_TEST);
    this._dCopy.draw(Assets.get("bg"));
    GL.enable(GL.DEPTH_TEST);
    GL.setMatrices(this.camera);

    this.renderBlocks(true);

    // g = 0.1;
    // this._dBall.draw(this._hit, [g, g, g], [0.82, 0, 0]);

    g = 300;
    GL.viewport(0, 0, g, g);
    this._dCopy.draw(this._fluid.density);

    if (canSave && !hasSaved && Config.autoSave) {
      saveImage(GL.canvas, getDateString());
      hasSaved = true;
    }
  }

  resize() {
    const pixelRatio = GL.isMobile ? 1 : 2;
    const { innerWidth, innerHeight } = window;
    GL.setSize(innerWidth * pixelRatio, innerHeight * pixelRatio);
    this.camera.setAspectRatio(GL.aspectRatio);

    this.orbitalControl.radius.setTo(innerWidth > innerHeight ? 8 : 20);
  }
}

export default SceneApp;
