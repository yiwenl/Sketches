import {
  GL,
  FrameBuffer,
  FboPingPong,
  CameraOrtho,
  DrawBall,
  DrawAxis,
  DrawCopy,
  DrawCamera,
  Scene,
  HitTestor,
} from "alfrid";
import {
  RAD,
  toGlsl,
  random,
  randomInt,
  smoothstep,
  biasMatrix,
} from "./utils";
import Config from "./Config";
import Assets from "./Assets";

import { vec3, mat4, vec2 } from "gl-matrix";
import Scheduler from "scheduling";

import DrawFloor from "./DrawFloor";
import DrawSave from "./DrawSave.js";
import DrawPetals from "./DrawPetals.js";
import DrawSim from "./DrawSim.js";
import DrawFloatingParticles from "./DrawFloatingParticles.js";
import DrawCompose from "./DrawCompose.js";

// pose detection
import PoseDetection, { POSE_FOUND, POSE_LOST } from "./PoseDetection";

// textures
import applyBlur from "./applyBlur";
import generateBlueNoise from "./generateBlueNoise.js";
import generateAOMap from "./generateAOMap";

// socket
import { io } from "socket.io-client";

const HIT_RADIUS_LIMIT = 5;
const MAX_IDLE_TIME = 10000;

class SceneApp extends Scene {
  constructor() {
    super();

    this._seedTime = random(100);
    this.camera.setPerspective(70 * RAD, GL.aspectRatio, 1, 28);
    const radiusLimit = 14;
    this.orbitalControl.radius.limit(radiusLimit, radiusLimit);
    const mtxShift = mat4.create();
    mat4.translate(mtxShift, mtxShift, [0, -0.7, 0]);
    this.orbitalControl.updateShiftMatrix(mtxShift);
    // this.orbitalControl.radius.value = radiusLimit;
    // this.orbitalControl.radius.setTo(radiusLimit);

    this.orbitalControl.rx.limit(0.1, -Math.PI / 2 + 0.1);
    if (GL.isMobile) {
      this.orbitalControl.lock();
      this.orbitalControl.rx.value = -0.2;
    }

    // shadow
    let r = 15;
    this._lightPosition = [0.1, 20, 0.1];
    this._cameraLight = new CameraOrtho();
    this._cameraLight.ortho(-r, r, r, -r, 7, 23);
    this._cameraLight.lookAt(this._lightPosition, [0, 0, 0]);

    this.mtxShadow = mat4.create();
    mat4.mul(
      this.mtxShadow,
      this._cameraLight.projection,
      this._cameraLight.view
    );
    mat4.mul(this.mtxShadow, biasMatrix, this.mtxShadow);

    // this.orbitalControl.lock();

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        this._hit = [999, 999, 999];
        this._preHit = [999, 999, 999];
      }
    });

    this._hit = [999, 999, 999];
    this._preHit = [999, 999, 999];

    if (Config.useSocket) this._initSocket();
    else this._initHitTest();

    addEventListener("blur", (event) => {
      this._hit = [999, 999, 999];
      this._preHit = [999, 999, 999];
    });

    if (Config.emitRandomBurst) {
      this.randomBurst();
    }

    if (Config.usePoseDetection) {
      this._initPoseDetection();
      this.orbitalControl.lock();
    }

    window.addEventListener("mousemove", this.onMouseMove);
    this._timeoutBurst = null;
    this._timeoutStartBurst = setTimeout(
      () => this.randomBurst(),
      MAX_IDLE_TIME
    );
  }

  _initSocket() {
    this.socket = io("https://192.168.1.209:8888", {
      secure: true,
      rejectUnauthorized: false,
    });

    this._isEmitLocked = false;

    this.socket.on("broadcastCameraData", (data) => {
      vec3.copy(this._preHit, this._hit);
      vec3.copy(this._hit, data.cameraPosOrg);
      vec3.scale(this._hit, this._hit, 4);
      this._hit[1] = Config.floorLevel;
    });
  }

  _initPoseDetection() {
    this._poseDetection = new PoseDetection();
    this._poseDetection.on(POSE_FOUND, this._onPoseFound);
    this._poseDetection.on(POSE_LOST, () => {
      // this._flowForce.value = 1;
    });
  }

  _initHitTest() {
    this._hitTestor = new HitTestor(this._drawFloor.mesh, this.camera);
    this._hitTestor.on("onHit", (e) => {
      if (this._preHit[0] > 100) {
        vec3.copy(this._preHit, e.hit);
      } else {
        vec3.copy(this._preHit, this._hit);
      }
      vec3.copy(this._hit, e.hit);
      const r = HIT_RADIUS_LIMIT;
      const pxz = [this._hit[0], this._hit[2]];
      if (vec2.length(pxz) > r) {
        vec2.normalize(pxz, pxz);
        vec2.scale(pxz, pxz, r);
        this._hit[0] = pxz[0];
        this._hit[2] = pxz[1];
      }
    });

    this._hitTestor.on("onUp", () => {
      this._hit = [999, 999, 999];
      this._preHit = [999, 999, 999];
    });
  }

  onMouseMove = () => {
    this.stopRandomBurst();
  };

  stopRandomBurst() {
    // if (!this._timeoutBurst) return;
    // console.log("stop random burst");
    clearTimeout(this._timeoutBurst);
    clearTimeout(this._timeoutStartBurst);
    this._timeoutBurst = null;
    this._timeoutStartBurst = setTimeout(
      () => this.randomBurst(),
      MAX_IDLE_TIME
    );
  }

  randomBurst() {
    const { sin, cos, sqrt, PI } = Math;
    const a = random(PI * 2);
    const r = sqrt(random()) * HIT_RADIUS_LIMIT;
    const x = r * cos(a);
    const z = r * sin(a);
    this._hit = [x, Config.floorLevel, z];
    this._preHit = [x, Config.floorLevel, z + random(0.2, 1)];

    const f = 1000 / 60;
    const delay = randomInt(10, 100) * f;
    setTimeout(() => {
      vec3.copy(this._preHit, this._hit);
    }, f);
    this._timeoutBurst = setTimeout(() => this.randomBurst(), delay);
  }

  _initTextures() {
    this.resize();

    const { numParticles: num } = Config;
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
    this._fboPosOrg = new FrameBuffer(num, num, oSettings);
    this._fboRender = new FrameBuffer(GL.width, GL.height);

    let fboSize = 1024 * 2;
    this._fboShadow = new FrameBuffer(fboSize, fboSize, oSettingsShadow);

    // textures
    this._textureNoise = generateBlueNoise();

    this._fboRender = new FrameBuffer(GL.width, GL.height);

    this._textureLookup = Assets.get("lookup");
    this._textureLookup.minFilter = GL.NEAREST;
    this._textureLookup.magFilter = GL.NEAREST;
  }

  _initViews() {
    this._dAxis = new DrawAxis();
    this._dCopy = new DrawCopy();
    this._dBall = new DrawBall();
    this._dCamera = new DrawCamera();
    this._drawFloor = new DrawFloor();
    this._drawPetals = new DrawPetals();
    this._drawCompose = new DrawCompose();

    this._drawFloat = new DrawFloatingParticles();

    // init particles
    this._drawSim = new DrawSim();
    new DrawSave().bindFrameBuffer(this._fbo.read).draw();
    this._fboPosOrg.bind();
    GL.clear(0, 0, 0, 1);
    this._dCopy.draw(this._fbo.read.getTexture(0));
    this._fboPosOrg.unbind();
  }

  update() {
    let d = vec3.distance(this._hit, this._preHit);
    const minRadius = Config.useSocket ? 0.1 : 0.4;
    d = smoothstep(0, minRadius, d);
    let resetSpeed = 2;
    if (Config.useSocket) {
      resetSpeed = 5;
    }

    this._drawSim
      .bindFrameBuffer(this._fbo.write)
      .bindTexture("uPosMap", this._fbo.read.getTexture(0), 0)
      .bindTexture("uVelMap", this._fbo.read.getTexture(1), 1)
      .bindTexture("uExtraMap", this._fbo.read.getTexture(2), 2)
      .bindTexture("uDataMap", this._fbo.read.getTexture(3), 3)
      .bindTexture("uPosOrgMap", this._fboPosOrg.texture, 4)
      .uniform("uTime", Scheduler.getElapsedTime() + this._seedTime)
      .uniform("uTouch", this._hit)
      .uniform("uFloor", Config.floorLevel)
      .uniform("uEmitStrength", d)
      .uniform("uResetSpeed", GL.isMobile ? 5 : resetSpeed)
      .draw();

    this._fbo.swap();

    this._updateShadowMap();
  }

  _updateShadowMap() {
    this._fboShadow.bind();
    GL.clear(0, 0, 0, 1);
    GL.setMatrices(this._cameraLight);
    this._renderPetals(false);
    this._fboShadow.unbind();
  }

  _renderPetals(mShadow = false) {
    GL.disable(GL.CULL_FACE);

    const tDepth = mShadow
      ? this._fboShadow.depthTexture
      : this._fboPosOrg.texture;

    const { colorShadow, colorPetal } = Config;
    const _colorShadow = colorShadow.map(toGlsl);
    const _colorPetal = colorPetal.map(toGlsl);

    this._drawPetals
      .bindTexture("uPosMap", this._fbo.read.getTexture(0), 0)
      .bindTexture("uDataMap", this._fbo.read.getTexture(3), 1)
      .bindTexture("uDepthMap", tDepth, 2)
      .uniform("uShadowMatrix", this.mtxShadow)
      .uniform("uLight", this._lightPosition)
      .uniform("uColor", _colorPetal)
      .uniform("uColorShadow", _colorShadow)
      .draw();

    const time = Scheduler.getElapsedTime() + this._seedTime;
    this._drawFloat
      .uniform("uLight", this._lightPosition)
      .uniform("uTime", time)
      .uniform("uColor", _colorPetal)
      .uniform("uColorShadow", _colorShadow)
      .draw();

    GL.enable(GL.CULL_FACE);
  }

  render() {
    const { usePostEffect } = Config;
    let g = 0.1;
    const colorBg = Config.colorBg.map(toGlsl);
    const colorShadow = Config.colorShadow.map(toGlsl);
    GL.clear(...colorBg, 1);
    GL.setMatrices(this.camera);

    this._fboRender.bind();
    GL.clear(...colorBg, 1);

    this._renderPetals(true);

    this._drawFloor
      .bindTexture("uDepthMap", this._fboShadow.depthTexture, 0)
      .uniform("uShadowMatrix", this.mtxShadow)
      .uniform("uColor", colorBg)
      .uniform("uColorShadow", colorShadow)
      .draw();

    this._fboRender.unbind();

    if (usePostEffect) {
      // render ao map
      this._textureAO = generateAOMap(this._fboRender.depthTexture);

      // generate blurred map
      this._textureBlurredRender = applyBlur(this._fboRender.texture);
    }

    const { near, far } = this.camera;
    let focus = (this.orbitalControl.radius.value + 3.2 - near) / (far - near);

    GL.disable(GL.DEPTH_TEST);
    if (Config.usePostEffect) {
      this._drawCompose
        .bindTexture("uMap", this._fboRender.texture, 0)
        .bindTexture("uAOMap", this._textureAO, 1)
        .bindTexture("uNoiseMap", this._textureNoise, 2)
        .bindTexture("uBlurMap", this._textureBlurredRender, 3)
        .bindTexture("uDepthMap", this._fboRender.depthTexture, 4)
        .bindTexture("uLookupMap", this._textureLookup, 5)
        .uniform("uRatio", GL.aspectRatio)
        .uniform("uFocus", focus)
        .uniform("uNear", near)
        .uniform("uFar", far)
        .draw();
    } else {
      this._dCopy.draw(this._fboRender.texture);
    }

    GL.enable(GL.DEPTH_TEST);
  }

  resize() {
    const pixelRatio = GL.isMobile ? 1 : 1.5;
    const { innerWidth, innerHeight } = window;
    GL.setSize(innerWidth * pixelRatio, innerHeight * pixelRatio);
    this.camera?.setAspectRatio?.(GL.aspectRatio);

    this._fboRender = new FrameBuffer(GL.width, GL.height);
  }
}

export default SceneApp;
