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
  EaseNumber,
} from "alfrid";
import {
  mix,
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
import DrawLine from "./DrawLine";

// hand detection
import HandPoseDetection, {
  ON_HANDS_LOST,
  ON_HANDS_DETECTED,
} from "./hand-detection";
import jointPairs from "./skeletonPairs";

// debug hand
import { createCanvas } from "./utils/setupProject2D";

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
    // this.orbitalControl.ry.setTo(0.7);
    // this.orbitalControl.rx.setTo(-0.5);
    this.orbitalControl.radius.setTo(15);
    this.orbitalControl.radius.limit(5, 40);
    this.resize();

    this._hit = [0, 0, 0];
    this._preHit = [0, 0, 0];
    this.seed = random(10);
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

    this.pulseStrength = new EaseNumber(1, 0.1);

    // generate lines
    this._lines = [];
    let numLines = 10;
    this._pointAs = [];
    this._pointBs = [];
    while (numLines--) {
      const r = 3;
      const a = [random(-r, r), random(-r, r), random(-r, r)];
      const b = [random(-r, r), random(-r, r), random(-r, r)];
      this._pointAs.push(a);
      this._pointBs.push(b);
      this._lines.push({ a, b });
    }

    this._pointAs = this._pointAs.flat();
    this._pointBs = this._pointBs.flat();

    // hand detection
    const videoScale = 2;
    const targetWidth = 360 * videoScale;
    const targetHeight = 240 * videoScale;
    this._handDetection = new HandPoseDetection(targetWidth, targetHeight);
    this._handDetection.on(ON_HANDS_DETECTED, this._onHandsDetected);
    this._handDetection.on(ON_HANDS_LOST, this._onHandsLost);
    this._joints = [];

    // debug hands
    const { canvas, ctx } = createCanvas(targetWidth, targetHeight);
    document.body.appendChild(canvas);
    canvas.id = "canvas-hand";
    this.ctx = ctx;
    this.ctx.fillStyle = `rgba(0, 0, 0, .5)`;
    this.ctx.fillRect(0, 0, targetWidth, targetHeight);
    canvas.style.width = `${targetWidth / 2}px`;
    canvas.style.height = `${targetHeight / 2}px`;

    setTimeout(() => {
      canSave = true;
    }, 500);

    // setTimeout(() => this.pulse(), randomInt(2000, 1000));
  }

  pulse() {
    // this.pulseStrength.easing = random(0.1, 0.2);
    this.pulseStrength.setTo(random(120, 140) + 100);
    // this.pulseStrength.setTo(random(20, 40)) * 15;
    this.pulseStrength.value = 1;

    setTimeout(() => this.pulse(), randomInt(2000, 3000));
  }

  _onHandsDetected = (hands) => {
    const { width, height } = this.ctx.canvas;
    // debug
    this.ctx.clearRect(0, 0, width, height);
    this.ctx.fillStyle = `rgba(0, 0, 0, .5)`;
    this.ctx.fillRect(0, 0, width, height);

    const findJoint = (name, points) => {
      const point = points.find((p) => p.name === name);
      const s = 20;
      return [-point.x * s, -point.y * s, point.z * s];
    };

    this._joints = [];
    hands.forEach(({ handedness, keypoints3D }) => {
      if (random() < 0.1) {
        console.table(keypoints3D);
      }
      jointPairs.forEach(([nameA, nameB]) => {
        const a = findJoint(nameA, keypoints3D);
        const b = findJoint(nameB, keypoints3D);
        this._joints.push({ a, b });
      });
    });
  };

  _onHandsLost = () => {
    const { width, height } = this.ctx.canvas;
    this.ctx.clearRect(0, 0, width, height);
    this.ctx.fillStyle = `rgba(0, 0, 0, .2)`;
    this.ctx.fillRect(0, 0, width, height);
  };

  _initTextures() {
    this.resize();
    const oSettings = {
      type: GL.FLOAT,
      minFilter: GL.NEAREST,
      magFilter: GL.NEAREST,
    };

    const { numParticles: num } = Config;
    this._fbo = new FboPingPong(num, num, oSettings, 5);
    this._fboPos = new FrameBuffer(num, num, oSettings);

    const fboSize = 2048;
    this._fboShadow = new FrameBuffer(fboSize, fboSize);
  }

  _initViews() {
    this._dAxis = new DrawAxis();
    this._dCopy = new DrawCopy();
    this._dBall = new DrawBall();
    this._dLine = new DrawLine();
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
      .bindTexture("uSpawnMap", this._fbo.read.getTexture(4), 4)
      .bindTexture("uPosOrgMap", this._fboPos.texture, 5)
      .bindTexture("uFluidMap", this._fluid.velocity, 6)
      .bindTexture("uDensityMap", this._fluid.density, 7)
      .uniform("uPointAs", "vec3", this._pointAs)
      .uniform("uPointBs", "vec3", this._pointBs)
      .uniform("uTime", Scheduler.getElapsedTime())
      .uniform("uBound", hitPlaneSize)
      .draw();

    this._fbo.swap();

    this.updateShadowMap();
  }

  updateFluid() {
    const strength = 1;
    const noise = 1;

    let num = 6;
    const time = Scheduler.getElapsedTime() * 0.5 + this._startTime;

    const { PI } = Math;
    const c = [0.5, 0.5];

    const swirl = (c, maxRadius, flowDir) => {
      for (let i = 0; i < num; i++) {
        const p = i / num;
        const r = random(maxRadius * 0.25, maxRadius);
        const a = p * PI * 2 + random(-1, 1) * 0.2;
        const pos = [r, 0];
        vec2.rotate(pos, pos, [0, 0], a);
        vec2.add(pos, pos, c);

        const s = this.pulseStrength.value > 1 ? 0 : 1;

        const dir = [-flowDir * s, flowDir * 0.5];
        vec2.normalize(dir, dir);
        vec2.rotate(dir, dir, [0, 0], a);

        const str = random(0.5, 1) * this.pulseStrength.value * 0.2;

        const radius = this.pulseStrength.value > 1 ? 2.4 : 1.8;
        this._fluid.updateFlow(pos, dir, str, radius, noise);
      }
    };

    const pos0 = [0.3, 0.5];
    const pos1 = [0.7, 0.5];
    const pos2 = [0.4, 0.3];
    const t = time * 0.5;
    vec2.rotate(pos0, pos0, c, t);
    vec2.rotate(pos1, pos1, c, t * 1.2);
    vec2.rotate(pos1, pos1, c, -t * 0.6);

    // swirl(pos0, random(0.3, 0.5), 1);
    swirl(pos0, random(0.3, 0.2), 1);
    swirl(pos1, random(0.3, 0.2), -1);
    swirl(pos2, 0.2, -1);

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
    let g = 0.05;
    GL.clear(...getMonocolor(g), 1);
    GL.disable(GL.DEPTH_TEST);
    this._dCopy.draw(Assets.get("bg"));
    GL.enable(GL.DEPTH_TEST);
    GL.setMatrices(this.camera);

    // this.renderBlocks(true);

    g = 0.1;

    this._joints.forEach(({ a, b }) => {
      this._dBall.draw(a, [g, g, g], [1, 0, 0]);
      this._dBall.draw(b, [g, g, g], [0, 1, 0]);
      this._dLine.draw(a, b, [1, 0.5, 0], 0.02);
    });

    // g = 0.1;
    // this._dBall.draw(this._hit, [g, g, g], [0.82, 0, 0]);

    // g = 300;
    // GL.viewport(0, 0, g, g);
    // this._dCopy.draw(this._fluid.density);

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
