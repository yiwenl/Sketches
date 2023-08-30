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
  random,
  randomInt,
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
import DrawSaveSingle from "./DrawSaveSingle";
import DrawBlocks from "./DrawBlocks";
import DrawLine from "./DrawLine";
import DrawBg from "./DrawBg";

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
const minLifeScale = 0.5;

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
    this._lifeScale = minLifeScale;

    let x = 0;
    let y = 0;
    const initFingers = () => {
      const fingers = [];
      for (let i = 0; i < 5; i++) {
        fingers.push({ x, y });
      }
      return fingers;
    };
    this.hands = {
      left: {
        fingers: initFingers(),
        fingersPrev: initFingers(),
      },
      right: {
        fingers: initFingers(),
        fingersPrev: initFingers(),
      },
    };

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
    this._lightPosition = [0, 7, 3];
    this._cameraLight.ortho(-r, r, r, -r, 1, 15);
    this._cameraLight.lookAt(this._lightPosition, [0, 0, 0]);
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
    const numLines = 40;
    this._pointAs = [];
    this._pointBs = [];
    const { sin, cos, PI } = Math;
    const getPos = (a) => {
      const r = 3;
      const x = cos(a) * r;
      const y = sin(a) * r;
      return [x, y, 0];
    };

    for (let i = 0; i < numLines; i++) {
      const a = getPos((i / numLines) * PI * 2);
      const b = getPos(((i + 1) / numLines) * PI * 2);
      this._pointAs.push(a);
      this._pointBs.push(b);
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
    this._lifeScale = 1;
    const { width, height } = this.ctx.canvas;
    // debug
    this.ctx.clearRect(0, 0, width, height);
    this.ctx.fillStyle = `rgba(0, 0, 0, .5)`;
    this.ctx.fillRect(0, 0, width, height);

    const findJoint = (name, points, pointBase) => {
      const { x, y } = pointBase;
      const baseRange = 20;
      const tx = -(x / width - 0.5) * baseRange;
      const ty = -(y / height - 0.5) * baseRange * 0.5 + baseRange * 0.25;
      const point = points.find((p) => p.name === name);
      const s = 40;
      return [-point.x * s + tx, -point.y * s + ty, point.z * s];
    };

    this._joints = [];
    this._pointAs = [];
    this._pointBs = [];
    const base = "wrist";

    hands.forEach(({ handedness, keypoints3D, keypoints }) => {
      const pointBase = keypoints.find((p) => p.name === base);
      jointPairs.forEach(([nameA, nameB]) => {
        const a = findJoint(nameA, keypoints3D, pointBase);
        const b = findJoint(nameB, keypoints3D, pointBase);
        this._joints.push({ a, b });
        this._pointAs.push(a);
        this._pointBs.push(b);
      });
    });
    if (hands.length === 1) {
      this._pointAs = this._pointAs.concat(this._pointAs);
      this._pointBs = this._pointBs.concat(this._pointBs);
    }
    this._pointAs = this._pointAs.flat();
    this._pointBs = this._pointBs.flat();

    // get finger tips
    hands.forEach(({ handedness, keypoints }) => {
      const hand = this.hands[handedness.toLowerCase()];
      if (hand) {
        const { fingers } = hand;
        const fingerTips = keypoints.filter(({ name }) => {
          return name.indexOf("tip") > 1;
        });

        jointPairs.forEach(([a, b]) => {
          const pa = keypoints.find((p) => p.name === a);
          const pb = keypoints.find((p) => p.name === b);

          this.ctx.fillStyle = "rgb(255, 114, 0)";
          this.ctx.strokeStyle = "rgba(255, 255, 255, .5)";
          this.ctx.lineWidth = 2;
          this.ctx.beginPath();
          this.ctx.arc(pa.x, pa.y, 5, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.beginPath();
          this.ctx.arc(pb.x, pb.y, 5, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.beginPath();
          this.ctx.moveTo(pa.x, pa.y);
          this.ctx.lineTo(pb.x, pb.y);
          this.ctx.stroke();
        });

        if (fingerTips && fingerTips.length > 0) {
          fingerTips.forEach(({ x, y }, i) => {
            fingers[i].x = this._handDetection.width - x;
            fingers[i].y = this._handDetection.height - y;

            // this.ctx.fillStyle = "rgb(255, 114, 0)";
            // this.ctx.beginPath();
            // this.ctx.arc(x, y, 5, 0, Math.PI * 2);
            // this.ctx.fill();
          });

          this.needUpdateHit = true;
        }
      }
    });
  };

  _onHandsLost = () => {
    const { width, height } = this.ctx.canvas;
    this.ctx.clearRect(0, 0, width, height);
    this.ctx.fillStyle = `rgba(0, 0, 0, .2)`;
    this.ctx.fillRect(0, 0, width, height);

    this._joints = [];
    this._pointAs = [];
    this._pointBs = [];
    const { sin, cos, PI } = Math;
    const getPos = (a) => {
      const r = 3;
      const x = cos(a) * r;
      const y = sin(a) * r;
      return [x, y, 0];
    };

    const numLines = 40;
    for (let i = 0; i < numLines; i++) {
      const a = getPos((i / numLines) * PI * 2);
      const b = getPos(((i + 1) / numLines) * PI * 2);
      this._pointAs.push(a);
      this._pointBs.push(b);
    }

    this._pointAs = this._pointAs.flat();
    this._pointBs = this._pointBs.flat();
    this._lifeScale = minLifeScale;
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
    this._fboRndPos = new FrameBuffer(num, num, oSettings);

    const fboSize = 2048;
    this._fboShadow = new FrameBuffer(fboSize, fboSize);
  }

  _initViews() {
    this._dAxis = new DrawAxis();
    this._dCopy = new DrawCopy();
    this._dBall = new DrawBall();
    this._dLine = new DrawLine();
    this._dCamera = new DrawCamera();

    this._drawBg = new DrawBg();

    // init particles
    new DrawSave()
      .setClearColor(0, 0, 0, 0)
      .bindFrameBuffer(this._fbo.read)
      .draw();

    new DrawSaveSingle()
      .setClearColor(0, 0, 0, 0)
      .bindFrameBuffer(this._fboRndPos)
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
      .bindTexture("uPosRndMap", this._fboRndPos.texture, 8)
      .uniform("uPointAs", "vec3", this._pointAs)
      .uniform("uPointBs", "vec3", this._pointBs)
      .uniform("uTime", Scheduler.getElapsedTime())
      .uniform("uBound", hitPlaneSize)
      .uniform("uLifeScale", this._lifeScale)
      .draw();

    this._fbo.swap();

    this.updateShadowMap();
  }

  updateFluid() {
    const strength = 1;
    const noise = 1;

    const num = 4;
    const time = Scheduler.getElapsedTime() * 0.5;

    const { sin, cos } = Math;

    for (let i = 0; i < num; i++) {
      const radius = random(1, 3);
      let x = (i + 0.5) / num;
      let y = sin((i / num) * 8.0 + time * 0.8) * 0.25 + 0.5;

      const dir = [1, 0];
      vec2.rotate(dir, dir, [0, 0], random(-1, 1) * 0.5);
      this._fluid.updateFlow([x, y], dir, strength, radius, noise);
    }

    for (let i = 0; i < num; i++) {
      const radius = random(1, 3);
      let x = i / num;
      let y = cos((i / num) * 6.0 + time * 1.2) * 0.25 + 0.5;

      const dir = [-1, 0];
      vec2.rotate(dir, dir, [0, 0], random(-1, 1) * 0.5);
      this._fluid.updateFlow([x, y], dir, strength, radius, noise);
    }

    this.updateFluidWithHand();

    this._fluid.update();
  }

  updateFluidWithHand() {
    const thresholdMovement = 2;
    const { width, height } = this._handDetection;
    for (let s in this.hands) {
      const hand = this.hands[s];
      const { fingers, fingersPrev } = hand;

      fingers.forEach((finger, i) => {
        const fingerPrev = fingersPrev[i];

        const dir = [finger.x - fingerPrev.x, finger.y - fingerPrev.y];
        const len = vec2.length(dir);
        if (len > thresholdMovement) {
          const str = 100;
          const pos = [finger.x / width, finger.y / height];
          vec2.normalize(dir, dir);
          this._fluid.updateFlow(pos, dir, str, 1);
        }

        // overwrite prev
        fingerPrev.x = finger.x;
        fingerPrev.y = finger.y;
      });
    }
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
      .uniform("uLight", this._lightPosition)
      .draw();
  }

  render() {
    let g = 0.85;
    GL.clear(...getMonocolor(g), 1);
    GL.disable(GL.DEPTH_TEST);
    this._drawBg.draw();
    GL.enable(GL.DEPTH_TEST);
    GL.setMatrices(this.camera);

    // this._dAxis.draw();

    this.renderBlocks(true);

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

    this.orbitalControl.radius.setTo(innerWidth > innerHeight ? 12 : 20);
  }
}

export default SceneApp;
