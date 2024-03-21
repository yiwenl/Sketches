import {
  GL,
  DrawBall,
  DrawAxis,
  DrawCopy,
  // DrawCamera,
  Scene,
  FrameBuffer,
  FboPingPong,
  CameraOrtho,
  HitTestor,
  Geom,
  EaseNumber,
} from "alfrid";

import {
  RAD,
  random,
  randomInt,
  getMonoColor,
  biasMatrix,
  smoothstep,
  pick,
} from "./utils";
import Config from "./Config";
import Assets from "./Assets";
import Scheduler from "scheduling";
import { vec2, vec3, mat4 } from "gl-matrix";

// debug hand
import { createCanvas } from "./utils/setupProject2D";

// particles
import DrawSave from "./DrawSave";
import DrawParticles from "./DrawParticles";
import DrawSim from "./DrawSim";
import DrawRibbon from "./DrawRibbon";
import DrawCover from "./DrawCover";
import DrawBackground from "./DrawBackground";
import DrawFloor from "./DrawFloor";
import DrawCompose from "./DrawCompose";
import DrawFxaa from "./DrawFxaa";
import DrawFlowParticles from "./DrawFlowParticles";

import generateBlueNoise from "./generateBlueNoise";
import generateBg from "./generateBg";
import applyBlur from "./applyBlur";

// hand detection
import HandPoseDetection, {
  ON_HANDS_LOST,
  ON_HANDS_DETECTED,
} from "./hand-detection";

class SceneApp extends Scene {
  constructor() {
    super();
    // this.orbitalControl.lock();

    this.orbitalControl.radius.value = 7.5;
    this.orbitalControl.radius.limit(6, 8);
    this.camera.setPerspective(60 * RAD, GL.aspectRatio, 1, 20);
    if (Config.useHandDetection) {
      this.orbitalControl.lock();
    }

    // shadow
    let r = 8;
    this._lightPosition = [0.1, 5, 5];
    vec3.rotateY(this._lightPosition, this._lightPosition, [0, 0, 0], 0.4);
    vec3.rotateX(this._lightPosition, this._lightPosition, [0, 0, 0], 0.2);
    this._cameraLight = new CameraOrtho();
    this._cameraLight.ortho(-r, r, r, -r, 2, 20);
    this._cameraLight.lookAt(this._lightPosition, [0, 0, 0]);

    r = 10;
    this._cameraFloorShadow = new CameraOrtho();
    this._cameraFloorShadow.ortho(-r, r, r, -r, 4, 17);
    const posLight = [0, 10, 0];
    vec3.rotateX(posLight, posLight, [0, 0, 0], 0.2);
    this._cameraFloorShadow.lookAt(posLight, [0, 0, 0]);

    this.mtxShadow = mat4.create();
    mat4.mul(
      this.mtxShadow,
      this._cameraLight.projection,
      this._cameraLight.view
    );
    mat4.mul(this.mtxShadow, biasMatrix, this.mtxShadow);

    this.mtxShadowFloor = mat4.create();
    mat4.mul(
      this.mtxShadowFloor,
      this._cameraFloorShadow.projection,
      this._cameraFloorShadow.view
    );
    mat4.mul(this.mtxShadowFloor, biasMatrix, this.mtxShadowFloor);

    this._seedTime = random(1000);
    this._hit = [999, 999, 999];
    this._center = [0, 0, 0];
    if (!GL.isMobile) {
      this._initHit();
    }

    // color
    this._currColorIndex = Config.colorIndex;
    this._prevColorIndex = Config.colorIndex;
    this._colorOffset = new EaseNumber(0, 0.05);
    this.switchColor();

    this.speed = new EaseNumber(1, 0.08);
    this.lengthScale = new EaseNumber(1, 0.1);
    this.noiseScale = 1;
    // this.pulse();

    this._length = 0;
    if (Config.useHandDetection) {
      this._initHandDetection();
    }
    this._onHandsLost();
  }

  pulse() {
    this.speed.setTo(20);
    // this.switchColor();

    this._seedTime += random(500, 1000);
    const radius = 1.5;
    const minDist = 1.2;
    const prevCenter = [this._center[0], this._center[1]];
    let x, y;
    let numTries = 0;
    let d;
    do {
      x = random(-1, 1) * radius;
      y = ((random(-1, 1) * radius) / GL.aspectRatio) * 0.5 + 0.2;
      d = vec2.distance([x, y], prevCenter);
    } while (d < minDist && numTries++ < 50);

    d = smoothstep(minDist, minDist * 2, d);

    this._center[0] = x;
    this._center[1] = y;

    // this._center[0] = random(-1, 1) * radius;
    // this._center[1] = (random(-1, 1) * radius) / GL.aspectRatio;
    let ns;
    do {
      ns = randomInt(2, 6) * 0.4;
    } while (ns === this.noiseScale);
    this.noiseScale = ns + d * 1.5;

    let delay = pick([0, 250]);
    if (Config.numSets > 8) {
      delay = 250;
    }

    setTimeout(() => {
      this.lengthScale.easing = 0.02;
      this.lengthScale.value = -0.2;
      this.lengthScale.value = 0.15;
    }, 1500);

    setTimeout(() => {
      this.speed.value = 0.1;
    }, 300 + delay);

    setTimeout(() => {
      this.lengthScale.easing = 0.03;
      this.lengthScale.easing = 0.04;
      this.lengthScale.value = 1.0;
    }, 2200 + delay);

    setTimeout(() => this.pulse(), 3000 + delay);
  }

  _initHandDetection() {
    const videoScale = 2;
    const targetWidth = 360 * videoScale;
    const targetHeight = 240 * videoScale;
    this._handDetection = new HandPoseDetection(targetWidth, targetHeight);
    this._handDetection.on(ON_HANDS_DETECTED, this._onHandsDetected);
    this._handDetection.on(ON_HANDS_LOST, this._onHandsLost);

    // debug hands
    const { canvas, ctx } = createCanvas(targetWidth, targetHeight);
    document.body.appendChild(canvas);
    canvas.id = "canvas-hand";
    this.ctx = ctx;
    this.ctx.fillStyle = `rgba(0, 0, 0, .5)`;
    this.ctx.fillRect(0, 0, targetWidth, targetHeight);
    canvas.style.width = `${targetWidth / 2}px`;
    canvas.style.height = `${targetHeight / 2}px`;
  }

  _initTextures() {
    this.resize();

    const { numParticles: num, numSets } = Config;
    const oSettings = {
      minFilter: GL.NEAREST,
      magFilter: GL.NEAREST,
      type: GL.FLOAT,
    };
    const oSettingsShadow = {
      minFilter: GL.LINEAR,
      magFilter: GL.LINEAR,
    };

    this._fbo = new FboPingPong(num, num, oSettings, 4);
    this._fboRender = new FrameBuffer(GL.width, GL.height);
    this._fboCompose = new FrameBuffer(GL.width, GL.height);

    let fboSize = num * numSets;
    this._fboPos = new FrameBuffer(fboSize, fboSize, oSettings);
    this._fboPos.bind();
    GL.clear(0, 0, 0, 1);
    this._fboPos.unbind();

    fboSize = 1024 * 2;
    this._fboShadow = new FrameBuffer(fboSize, fboSize, oSettingsShadow);
    // fboSize = 1024;
    this._fboShadowFloor = new FrameBuffer(fboSize, fboSize, oSettingsShadow);

    // blue noise
    this._textureNoise = generateBlueNoise();

    this._textureColor = Assets.get(`color${Config.colorIndex}`);
    this._textureColor.minFilter = this._textureColor.magFilter = GL.NEAREST;

    this._textureLookup = Assets.get("lookup");
    this._textureLookup.minFilter = this._textureLookup.magFilter = GL.NEAREST;

    this._index = 0;
  }

  _initViews() {
    this._dAxis = new DrawAxis();
    this._dCopy = new DrawCopy();
    this._dBall = new DrawBall();
    // this._dCamera = new DrawCamera();
    this._drawCover = new DrawCover();
    this._drawBackground = new DrawBackground();
    this._drawFloor = new DrawFloor();
    this._drawFlowParticles = new DrawFlowParticles();
    this._drawFxaa = new DrawFxaa();
    this._drawCompose = new DrawCompose()
      .setClearColor(0, 0, 0, 0)
      .bindFrameBuffer(this._fboCompose);

    // init particles
    new DrawSave().bindFrameBuffer(this._fbo.read).draw();
    this._drawSim = new DrawSim();
    this._drawParticles = new DrawParticles();
    this._drawRibbon = new DrawRibbon();
  }

  _onHandsDetected = (hands) => {
    // console.log("hands detected", hands);

    const dot = (x, y, r = 5) => {
      this.ctx.beginPath();
      this.ctx.arc(x, y, r, 0, Math.PI * 2);
      this.ctx.fill();
    };

    const { width, height } = this.ctx.canvas;
    this.ctx.clearRect(0, 0, width, height);
    this.ctx.fillStyle = `rgba(0, 0, 0, .5)`;
    this.ctx.fillRect(0, 0, width, height);

    this._tips = [];
    hands.forEach((hand, i) => {
      const { keypoints, keypoints3D } = hand;
      const wrist = keypoints.find((kp) => kp.name === "wrist");
      let s = 10;
      const offsetX = -(wrist.x / width - 0.5) * s * GL.aspectRatio;
      const offsetY = -(wrist.y / height - 0.5) * s;
      const offsetZ = 0;
      if (i === 0) {
        this.orbitalControl.ry.value = wrist.x / width - 0.5;
      }

      let tips = keypoints3D.filter((kp) => kp.name.indexOf("tip") > -1);
      s = 40;
      tips.forEach(({ x, y, z }) => {
        this._tips.push([x * s + offsetX, -y * s + offsetY, z * s + offsetZ]);
      });

      // debug hands
      tips = keypoints.filter((kp) => kp.name.indexOf("tip") > -1);
      this.ctx.fillStyle = "rgb(255, 114, 0)";
      tips.forEach(({ x, y }) => {
        dot(x, y, 5);
      });
    });

    if (this._tips.length < 10) {
      this._tips = this._tips.concat(this._tips);
    }
    // const hand = hands[0];
  };

  _onHandsLost = () => {
    this._tips = [];
    for (let i = 0; i < 10; i++) {
      this._tips.push([999, 999, 999]);
    }

    if (this.ctx) {
      const { width, height } = this.ctx.canvas;
      this.ctx.clearRect(0, 0, width, height);
      this.ctx.fillStyle = `rgba(0, 0, 0, .5)`;
      this.ctx.fillRect(0, 0, width, height);
    }
  };

  updateColor() {
    this._prevColorIndex = this._currColorIndex;
    this._currColorIndex = Config.colorIndex;
    this.switchColor();
  }

  switchColor() {
    this._texColorCurr = Assets.get(`color${this._currColorIndex}`);
    this._texColorPrev = Assets.get(`color${this._prevColorIndex}`);

    this._bgCurr = generateBg(
      this._texColorCurr,
      `color${this._currColorIndex}`
    );
    this._bgPrev = generateBg(
      this._texColorPrev,
      `color${this._prevColorIndex}`
    );

    this._colorOffset.setTo(0);
    this._colorOffset.value = 1;
  }

  _initHit() {
    const r = 15;
    // const mesh = Geom.plane(r, r / GL.aspectRatio, 1);
    const mesh = Geom.sphere(3, 24);
    // this._hitTestor = new HitTestor(Geom.sphere(3, 24), this.camera);
    this._hitTestor = new HitTestor(mesh, this.camera);
    this._hitTestor.on("onHit", (e) => {
      vec3.copy(this._hit, e.hit);

      if (!Config.useHandDetection) {
        this._tips = [];
        for (let i = 0; i < 10; i++) {
          this._tips.push([this._hit[0], this._hit[1], this._hit[2]]);
        }
      }
    });

    this._hitTestor.on("onUp", () => {
      this._hit = [999, 999, 999];
    });
  }

  update() {
    this._length = Math.sin(Scheduler.getElapsedTime() * 0.85) * 0.45 + 0.55;

    this._drawSim
      .bindFrameBuffer(this._fbo.write)
      .bindTexture("uPosMap", this._fbo.read.getTexture(0), 0)
      .bindTexture("uVelMap", this._fbo.read.getTexture(1), 1)
      .bindTexture("uExtraMap", this._fbo.read.getTexture(2), 2)
      .bindTexture("uDataMap", this._fbo.read.getTexture(3), 3)
      .uniform("uTime", Scheduler.getElapsedTime() + this._seedTime)
      .uniform("uSpeed", this.speed.value)
      .uniform("uTouch", this._hit)
      .uniform("uNoiseScale", this.noiseScale)
      .uniform("uCenter", this._center)
      .uniform("uTips", "vec3", this._tips.flat())
      .uniform("uTouchDist", Config.useHandDetection ? 1 : 1 / 4)
      .draw();

    this._fbo.swap();

    const { numParticles: num, numSets: numSetsStr } = Config;
    const numSets = parseInt(numSetsStr);

    const tx = this._index % numSets;
    const ty = Math.floor(this._index / numSets);
    this._index++;
    if (this._index >= numSets * numSets) {
      this._index = 0;
    }

    GL.disable(GL.DEPTH_TEST);
    this._fboPos.bind();
    GL.viewport(tx * num, ty * num, num, num);
    this._dCopy.draw(this._fbo.read.getTexture(0));
    this._fboPos.unbind();
    GL.enable(GL.DEPTH_TEST);

    this._updateShadowMap(false);
  }

  _updateShadowMap() {
    this._fboShadow.bind();
    GL.clear(0, 0, 0, 1);
    GL.setMatrices(this._cameraLight);
    this._renderRibbon(false);
    this._fboShadow.unbind();

    this._fboShadowFloor.bind();
    GL.clear(0, 0, 0, 1);
    GL.setMatrices(this._cameraFloorShadow);
    this._renderRibbon(false);
    this._fboShadowFloor.unbind();
  }

  _renderRibbon(mShadow = false) {
    const tDepth = mShadow
      ? this._fboShadow.depthTexture
      : this._fbo.read.getTexture(0);

    this._drawRibbon
      .bindTexture("uPosMap", this._fboPos.texture, 0)
      .bindTexture("uDepthMap", tDepth, 1)
      .bindTexture("uColorMapCurr", this._texColorCurr, 2)
      .bindTexture("uColorMapPrev", this._texColorPrev, 3)
      .uniform("uColorOffset", this._colorOffset.value)
      .uniform("uIndex", this._index)
      .uniform("uLight", this._lightPosition)
      .uniform("uShadowMatrix", this.mtxShadow)
      .uniform("uColor", getMonoColor(1))
      .uniform("uTime", Scheduler.getElapsedTime())
      .uniform("uLengthOffset", this.lengthScale.value)
      .uniform("uTouch", this._hit)
      // .uniform("uLengthOffset", this._length)
      .draw();

    this._drawParticles
      .bindTexture("uPosMap", this._fbo.read.getTexture(0), 0)
      .bindTexture("uColorMapCurr", this._texColorCurr, 2)
      .bindTexture("uColorMapPrev", this._texColorPrev, 3)
      .uniform("uColorOffset", this._colorOffset.value)
      .uniform("uViewport", [GL.width, GL.height])
      .draw();
  }

  render() {
    let applyPost = Config.usePostEffect;
    let g = 0.91;
    GL.clear(...getMonoColor(g), 1);
    GL.setMatrices(this.camera);
    GL.disable(GL.DEPTH_TEST);

    if (applyPost) {
      this._fboRender.bind();
      GL.clear(0, 0, 0, 0);
    }
    this._drawBackground
      .bindTexture("uMapCurr", this._bgCurr, 0)
      .bindTexture("uMapPrev", this._bgPrev, 1)
      .uniform("uRatio", GL.aspectRatio)
      .uniform("uColorOffset", this._colorOffset.value)
      .draw();
    GL.enable(GL.DEPTH_TEST);

    g = 0.1;
    this._tips.forEach((tip) => {
      this._dBall.draw(tip, [g, g, g], [1, 0, 0]);
    });

    // g = 0.1;
    g = 0.2;

    this._drawFloor
      .bindTexture("uDepthMap", this._fboShadowFloor.depthTexture, 0)
      .uniform("uShadowMatrix", this.mtxShadowFloor)
      .draw();

    this._renderRibbon(true);

    this._drawFlowParticles
      .uniform("uViewport", [GL.width, GL.height])
      .uniform("uTime", Scheduler.getElapsedTime())
      .draw();

    if (applyPost) {
      // console.log(this.camera.near, this.camera.far);
      this._fboRender.unbind();
      this._textureBlurredRender = applyBlur(this._fboRender.texture);
      const { near, far } = this.camera;

      let focus =
        (this.orbitalControl.radius.value + 3.8 - near) / (far - near);
      this._drawCompose
        .bindFrameBuffer(this._fboCompose)
        .bindTexture("uMap", this._fboRender.texture, 0)
        .bindTexture("uBlurMap", this._textureBlurredRender, 1)
        .bindTexture("uDepthMap", this._fboRender.depthTexture, 2)
        .bindTexture("uNoiseMap", this._textureNoise, 3)
        .bindTexture("uLookupMap", this._textureLookup, 4)
        .uniform("uFocus", focus)
        .uniform("uRatio", GL.aspectRatio)
        .uniform("uNear", this.camera.near)
        .uniform("uFar", this.camera.far)
        .draw();

      this._drawFxaa
        .bindTexture("uMap", this._fboCompose.texture, 0)
        .uniform("rtWidth", GL.width)
        .uniform("rtHeight", GL.height)
        .draw();
    }

    GL.disable(GL.DEPTH_TEST);
    // this._drawCover
    //   .bindTexture("uMap", this._textureNoise, 0)
    //   .uniform("uRatio", GL.aspectRatio)
    //   .draw();
  }

  resize() {
    const pixelRatio = 1.5;
    const { innerWidth, innerHeight } = window;
    GL.setSize(innerWidth * pixelRatio, innerHeight * pixelRatio);
    this.camera?.setAspectRatio?.(GL.aspectRatio);
    this._fboRender = new FrameBuffer(GL.width, GL.height);
    this._fboCompose = new FrameBuffer(GL.width, GL.height);
  }
}

export default SceneApp;