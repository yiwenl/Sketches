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
  iOS,
  mix,
  random,
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

// debug hand
import { createCanvas } from "./utils/setupProject2D";

// fluid simulation
import FluidSimulation from "./fluid-sim";

// draw calls
import DrawSave from "./DrawSave";
import DrawBlocks from "./DrawBlocks";

// shaders
import vsPass from "shaders/pass.vert";
import fsSim from "shaders/sim.frag";

// hand detection
import HandPoseDetection, {
  ON_HANDS_LOST,
  ON_HANDS_DETECTED,
} from "./hand-detection";

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

    this.orbitalControl.lockRotation();
    this.orbitalControl.radius.limit(5, 20);
    this.orbitalControl.rx.easing = 0.05;
    this.orbitalControl.ry.easing = 0.05;

    this._hit = [0, 0, 0];
    this._preHit = [0, 0, 0];
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

    const meshHit = Geom.plane(hitPlaneSize, hitPlaneSize, 1);

    const hitTestor = new HitTestor(meshHit, this.camera);
    this.needUpdateHit = false;
    hitTestor.on("onHit", (e) => {
      vec3.copy(this._hit, e.hit);
      this.needUpdateHit = true;
    });

    // shadow
    this._cameraLight = new CameraOrtho();
    const r = 10;
    this._cameraLight.ortho(-r, r, r, -r, 1, 15);
    this._cameraLight.lookAt([0, 7, 3], [0, 0, 0]);

    this.mtxShadow = mat4.create();
    mat4.mul(
      this.mtxShadow,
      this._cameraLight.projection,
      this._cameraLight.view
    );
    mat4.mul(this.mtxShadow, biasMatrix, this.mtxShadow);

    // hand detection
    const videoScale = 2;
    const targetWidth = 360 * videoScale;
    const targetHeight = 240 * videoScale;
    if (Config.handDetection) {
      this._handDetection = new HandPoseDetection(targetWidth, targetHeight);
      this._handDetection.on(ON_HANDS_DETECTED, this._onHandsDetected);
      this._handDetection.on(ON_HANDS_LOST, this._onHandsLost);
    } else {
      document.body.classList.add("no-hand-detection");
    }

    // debug hands
    const { canvas, ctx } = createCanvas(targetWidth, targetHeight);
    document.body.appendChild(canvas);
    canvas.id = "canvas-hand";
    this.ctx = ctx;
    this.ctx.fillStyle = `rgba(0, 0, 0, .5)`;
    this.ctx.fillRect(0, 0, targetWidth, targetHeight);
    canvas.style.width = `${targetWidth / 2}px`;
    canvas.style.height = `${targetHeight / 2}px`;

    window.addEventListener("mousemove", (e) => {
      const s = 0.5;
      let t = e.clientX / window.innerWidth - 0.5;
      this.orbitalControl.ry.value = -t * s;
      t = e.clientY / window.innerHeight - 0.5;
      this.orbitalControl.rx.value = -t * s;
    });

    setTimeout(() => {
      canSave = true;
    }, 500);
  }

  _initTextures() {
    this.resize();
    const type = iOS ? GL.HALF_FLOAT : GL.FLOAT;
    const oSettings = {
      type,
      minFilter: GL.NEAREST,
      magFilter: GL.NEAREST,
    };

    const { numParticles: num } = Config;
    this._fbo = new FboPingPong(num, num, oSettings, 4);
    this._fboPos = new FrameBuffer(num, num, oSettings);

    const fboSize = GL.isMobile ? 1024 : 2048;
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

  _onHandsDetected = (hands) => {
    const { width, height } = this.ctx.canvas;
    // debug
    this.ctx.clearRect(0, 0, width, height);
    this.ctx.fillStyle = `rgba(0, 0, 0, .5)`;
    this.ctx.fillRect(0, 0, width, height);

    // get finger tips
    hands.forEach(({ handedness, keypoints }) => {
      const hand = this.hands[handedness.toLowerCase()];
      if (hand) {
        const { fingers } = hand;
        const fingerTips = keypoints.filter(({ name }) => {
          return name.indexOf("tip") > 1;
        });

        if (fingerTips && fingerTips.length > 0) {
          fingerTips.forEach(({ x, y }, i) => {
            fingers[i].x = this._handDetection.width - x;
            fingers[i].y = this._handDetection.height - y;

            this.ctx.fillStyle = "rgb(255, 114, 0)";
            this.ctx.beginPath();
            this.ctx.arc(x, y, 5, 0, Math.PI * 2);
            this.ctx.fill();
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
  };

  updateFluid() {
    const strength = 2;
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

    if (this.needUpdateHit) {
      if (this._handDetection) {
        this.updateFluidWithHand();
      } else {
        const scale = GL.isMobile ? 5 : 1;
        const _dir = [0, 0, 0];
        vec3.sub(_dir, this._hit, this._preHit);
        const dir = [_dir[0], _dir[1]];
        const dist = vec2.length(dir);
        if (dist > 0) {
          let f = smoothstep(0, 0.5, dist);
          const r = mix(1, 3, f);
          vec2.normalize(dir, dir);
          f = mix(50, 150, f) * scale;

          const x = (this._hit[0] / hitPlaneSize) * 0.5 + 0.5;
          const y = (this._hit[1] / hitPlaneSize) * 0.5 + 0.5;
          this._fluid.updateFlow([x, y], dir, f, r * GL.isMobile ? 2 : 1, 0);
        }

        // copy hit position
        vec3.copy(this._preHit, this._hit);
      }

      this.needUpdateHit = false;
    }

    this._fluid.update();
  }

  updateFluidWithHand() {
    const thresholdMovement = 1;
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

    if (this._handDetection) {
      const { width, height } = this._handDetection;
      g = 0.08;

      for (let s in this.hands) {
        const { fingers } = this.hands[s];
        fingers.forEach(({ x, y }) => {
          const fx = (x / width - 0.5) * hitPlaneSize * 2;
          const fy = (y / height - 0.5) * hitPlaneSize * 2;
          this._dBall.draw([fx, fy, 0.5], [g, g, g], [1, 0.45, 0]);
        });
      }
    }
  }

  resize() {
    const pixelRatio = GL.isMobile ? 1 : 1.5;
    const { innerWidth, innerHeight } = window;
    GL.setSize(innerWidth * pixelRatio, innerHeight * pixelRatio);
    this.camera.setAspectRatio(GL.aspectRatio);

    this.orbitalControl.radius.setTo(innerWidth > innerHeight ? 12 : 20);
  }
}

export default SceneApp;
