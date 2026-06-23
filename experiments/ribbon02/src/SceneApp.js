import {
  GL,
  Geom,
  HitTestor,
  FrameBuffer,
  FboPingPong,
  DrawBall,
  DrawAxis,
  DrawCopy,
  DrawCamera,
  CameraOrtho,
  Scene,
} from "alfrid";
import { RAD, mix, random, smoothstep, biasMatrix } from "./utils";
import Config from "./Config";
import Assets from "./Assets";
import { vec2, vec3, mat4 } from "gl-matrix";
import Scheduler from "scheduling";

// draw calls
import DrawBg from "./DrawBg";
import DrawSave from "./DrawSave";
import DrawSim from "./DrawSim";
import DrawRibbon from "./DrawRibbon";
import DrawFloor from "./DrawFloor";
import DrawCompose from "./DrawCompose";
import DrawScramble from "./DrawScramble";
import DrawFlowUpdate from "./DrawFlowUpdate";
import DrawDebugFluid from "./DrawDebugFluid";

// textures
import generatePaperTexture from "./generatePaperTexture";
import generateAOMap from "./generateAOMap";
import generateFluidNoiseMap from "./generateFluidNoiseMap";



// fluid simulation
import FluidSimulation from "./fluid-sim";
import TrackPoint3D from "./TrackPoint3D";
import { HandLandmarkManager } from "digit";

const bound = 8;
const PALM_INDICES = [0, 5, 9, 13, 17];
const THUMB_TIP_INDEX = 4;
const INDEX_TIP_INDEX = 8;
const PINCH_DISTANCE_THRESHOLD = 0.05;
const clamp01 = (v) => Math.min(1, Math.max(0, v));

const getPalmCenter = (landmarks) => {
  if (!landmarks || landmarks.length <= 17) {
    return null;
  }

  let x = 0;
  let y = 0;
  let z = 0;
  PALM_INDICES.forEach((i) => {
    x += landmarks[i].x;
    y += landmarks[i].y;
    z += landmarks[i].z;
  });

  const s = 1 / PALM_INDICES.length;
  return { x: x * s, y: y * s, z: z * s };
};

const isPinching = (landmarks) => {
  const thumbTip = landmarks?.[THUMB_TIP_INDEX];
  const indexTip = landmarks?.[INDEX_TIP_INDEX];
  if (!thumbTip || !indexTip) {
    return false;
  }

  const dx = thumbTip.x - indexTip.x;
  const dy = thumbTip.y - indexTip.y;
  return Math.hypot(dx, dy) <= PINCH_DISTANCE_THRESHOLD;
};

class SceneApp extends Scene {
  constructor() {
    super();

    const minRadius = 10;
    this.orbitalControl.radius.value = 15;
    this.orbitalControl.radius.limit(minRadius, 15);
    this.orbitalControl.rx.limit(0.2, -1.0);

    const { numParticles: s, numSets: t } = Config;

    // init ribbon position
    this._fboPos.bind();
    for (let j = 0; j < t; j++) {
      for (let i = 0; i < t; i++) {
        GL.viewport(i * s, j * s, s, s);
        this._dCopy.draw(this._fbo.read.getTexture(0));
      }
    }
    this._fboPos.unbind();

    // fluid
    const DISSIPATION = 0.985;
    this._fluid = new FluidSimulation({
      DENSITY_DISSIPATION: DISSIPATION,
      VELOCITY_DISSIPATION: DISSIPATION,
      PRESSURE_DISSIPATION: DISSIPATION,
    });

    this._handManager = null;
    this._handPalmState = new Map();
    this._hasUnloadListener = false;
    this._isInitializingHandDetection = false;
    this._initHandDetection = this._initHandDetection.bind(this);
    this._onHandDetected = this._onHandDetected.bind(this);
    this._onBeforeUnload = this._onBeforeUnload.bind(this);

  }

  async _initHandDetection() {
    if (
      !Config.useHandDetection ||
      this._handManager ||
      this._isInitializingHandDetection
    ) {
      return;
    }

    this._isInitializingHandDetection = true;
    let manager = null;
    try {
      manager = new HandLandmarkManager({
        numHands: 2,
        mirror: true,
      });
      this._handManager = manager;
      await manager.init();

      // If another manager replaced this one while initializing, dispose this stale one.
      if (this._handManager && this._handManager !== manager) {
        if (manager.stop) {
          manager.stop();
        }
        if (manager.dispose) {
          manager.dispose();
        }
        return;
      }

      // Restore manager reference if it was temporarily nulled during async init.
      if (!this._handManager) {
        this._handManager = manager;
      }

      this._ensureCameraOverlay(this._handManager);
      this._handManager.removeEventListener("hand-detected", this._onHandDetected);
      this._handManager.addEventListener("hand-detected", this._onHandDetected);
    } catch (error) {
      console.error("Failed to initialize hand detection", error);
      if (this._handManager === manager) {
        this._destroyHandDetection();
      }
    } finally {
      this._isInitializingHandDetection = false;
    }
  }

  _ensureCameraOverlay(manager, retries = 60) {
    const video = manager?.video || document.getElementById("video");
    if (video) {
      this._attachCameraOverlay(video);
      return;
    }

    if (retries <= 0) {
      console.warn("Camera video element not found for overlay");
      return;
    }

    requestAnimationFrame(() => this._ensureCameraOverlay(manager, retries - 1));
  }

  _attachCameraOverlay(video) {
    if (!video) {
      return;
    }

    if (video.parentElement !== document.body) {
      document.body.appendChild(video);
    }

    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;

    video.style.setProperty("position", "fixed", "important");
    video.style.setProperty("top", "16px", "important");
    video.style.setProperty("left", "16px", "important");
    video.style.setProperty("width", "320px", "important");
    video.style.setProperty("height", "240px", "important");
    video.style.setProperty("transform", "scaleX(-1)", "important");
    video.style.setProperty("object-fit", "cover", "important");
    video.style.setProperty("border-radius", "8px", "important");
    video.style.setProperty("border", "1px solid rgba(255, 255, 255, 0.35)", "important");
    video.style.setProperty("background", "rgba(0, 0, 0, 0.35)", "important");
    video.style.setProperty("z-index", "2147483647", "important");
    video.style.setProperty("pointer-events", "none", "important");
    video.style.setProperty("display", "block", "important");
    video.style.setProperty("opacity", "1", "important");
    video.style.setProperty("visibility", "visible", "important");
  }

  _onHandDetected(e) {
    const results = e?.detail;
    const landmarks = results?.landmarks || [];
    if (landmarks.length === 0) {
      this._handPalmState.clear();
      return;
    }

    const now = performance.now();
    const handedness = results?.handedness || results?.handednesses || [];
    const activeKeys = new Set();

    landmarks.forEach((points, i) => {
      const palm = getPalmCenter(points);
      if (!palm) {
        return;
      }

      const key =
        handedness?.[i]?.[0]?.categoryName?.toLowerCase?.() || `hand-${i}`;
      const uv = [clamp01(1 - palm.x), clamp01(1 - palm.y)];
      const pinching = isPinching(points);
      const previous = this._handPalmState.get(key);
      this._handPalmState.set(key, { uv, time: now, pinching });
      activeKeys.add(key);

      if (!pinching || !previous || !previous.pinching) {
        return;
      }

      const dt = Math.max((now - previous.time) / 1000, 1 / 120);
      const dx = uv[0] - previous.uv[0];
      const dy = uv[1] - previous.uv[1];
      const distance = Math.hypot(dx, dy);
      if (distance < 0.0015) {
        return;
      }

      const speed = distance / dt;
      const force = smoothstep(0.04, 2.0, speed);
      if (force <= 0) {
        return;
      }

      const dir = [dx / distance, dy / distance];
      this._fluid.updateFlow(
        uv,
        dir,
        mix(1, 4, force),
        mix(1, 3, force) * 2,
        1
      );
    });

    this._handPalmState.forEach((_, key) => {
      if (!activeKeys.has(key)) {
        this._handPalmState.delete(key);
      }
    });
  }

  _destroyHandDetection() {
    this._isInitializingHandDetection = false;
    this._handPalmState.clear();
    if (!this._handManager) {
      return;
    }

    const video = this._handManager.video;
    this._handManager.removeEventListener("hand-detected", this._onHandDetected);
    if (this._handManager.stop) {
      this._handManager.stop();
    }
    if (this._handManager.dispose) {
      this._handManager.dispose();
    }
    if (video?.parentElement) {
      video.parentElement.removeChild(video);
    }
    this._handManager = null;
  }

  _onBeforeUnload() {
    this._destroyHandDetection();
  }


  _init() {
    this.resize();

    // camera settings
    const FOV = 60;
    this.camera.setPerspective(FOV * RAD, GL.aspectRatio, 2, 25);
    this._index = 0;

    this._hit = new TrackPoint3D();

    const mesh = Geom.plane(bound * 2, bound * 2, 1);
    this._drawDebugFluid = new DrawDebugFluid(mesh);
    this._hitTestor = new HitTestor(mesh, this.camera);

    this._hitTestor.on("onHit", (e) => {
      if (Config.useHandDetection) {
        return;
      }
      this._hit.update(e.hit);
      const { pos, prevPos, speed } = this._hit;
      let f = smoothstep(0, 1, speed);
      let r = bound;

      if (f > 0) {
        const mtxInvert = mat4.invert(
          mat4.create(),
          this._hitTestor.modelMatrix
        );
        const pInv = vec3.transformMat4(vec3.create(), pos, mtxInvert);
        const pInvPrev = vec3.transformMat4(vec3.create(), prevPos, mtxInvert);

        const _posMapped = pInv.map((v) => (v / r) * 0.5 + 0.5);
        const _pos = [_posMapped[0], _posMapped[1]];
        const dir = [pInv[0] - pInvPrev[0], pInv[1] - pInvPrev[1]];
        vec2.normalize(dir, dir);

        this._fluid.updateFlow(_pos, dir, mix(1, 4, f), mix(1, 3, f) * 2, 1);
      }
    });

    this._hitTestor.on("onUp", (e) => {
      this._hit.reset();
    });

    if (Config.useHandDetection) {
      this._initHandDetection();
    }
    if (!this._hasUnloadListener) {
      window.addEventListener("beforeunload", this._onBeforeUnload);
      this._hasUnloadListener = true;
    }

    this._seedTime = random(1000);

    // shadow
    let r = 12;
    this._lightPosition = [0.0, 10, -0.1];
    vec3.rotateX(this._lightPosition, this._lightPosition, [0, 0, 0], 0.87);
    this._cameraLight = new CameraOrtho();
    this._cameraLight.ortho(-r, r, r, -r, 2, 20);
    this._cameraLight.lookAt(this._lightPosition, [0, 0, 0]);

    // shadow matrix
    this.mtxShadow = mat4.create();
    mat4.mul(
      this.mtxShadow,
      this._cameraLight.projection,
      this._cameraLight.view
    );
    mat4.mul(this.mtxShadow, biasMatrix, this.mtxShadow);
  }

  _initTextures() {
    this._texturePaper = generatePaperTexture();
    this._textureLookup = Assets.get("lookupFuji");
    this._textureSkipColor = Assets.get("skipColor");
    this._textureLookup.minFilter = GL.NEAREST;
    this._textureLookup.magFilter = GL.NEAREST;
    this._textureSkipColor.minFilter = GL.NEAREST;
    this._textureSkipColor.magFilter = GL.NEAREST;

    const { numParticles: num, numSets } = Config;
    const oSettings = {
      minFilter: GL.NEAREST,
      magFilter: GL.NEAREST,
      type: GL.FLOAT,
    };
    this._fbo = new FboPingPong(num, num, oSettings, 4);

    // position array
    let fboSize = num * numSets;
    this._fboPos = new FrameBuffer(fboSize, fboSize, oSettings);
    this._fboScrambled = new FrameBuffer(fboSize, fboSize, oSettings);

    this._fboRender = new FrameBuffer(GL.width, GL.height, { type: GL.FLOAT });

    fboSize = 2048;
    this._fboShadow = new FrameBuffer(fboSize, fboSize, {
      minFilter: GL.LINEAR,
      magFilter: GL.LINEAR,
    });
  }

  _initViews() {
    this._dAxis = new DrawAxis();
    this._dCopy = new DrawCopy();
    this._dBall = new DrawBall();
    this._dCamera = new DrawCamera();

    this._drawBg = new DrawBg();
    this._drawFloor = new DrawFloor();
    this._drawCompose = new DrawCompose();

    // init particles
    new DrawSave().bindFrameBuffer(this._fbo.read).draw();
    this._drawSim = new DrawSim();
    this._drawRibbon = new DrawRibbon();
    this._drawScramble = new DrawScramble().bindFrameBuffer(this._fboScrambled);
    this._drawFlowUpdate = new DrawFlowUpdate();
  }

  update() {
    this.orbitalControl.ry.value += 0.02;

    // move light with camera
    this._lightPosition = [0.0, 10, -0.1];
    vec3.rotateX(this._lightPosition, this._lightPosition, [0, 0, 0], 0.7);
    vec3.rotateY(this._lightPosition, this._lightPosition, [0, 0, 0], this.orbitalControl.ry.value);
    this._cameraLight.lookAt(this._lightPosition, [0, 0, 0]);
    mat4.mul(
      this.mtxShadow,
      this._cameraLight.projection,
      this._cameraLight.view
    );
    mat4.mul(this.mtxShadow, biasMatrix, this.mtxShadow);

    const time = Scheduler.getElapsedTime() + this._seedTime;
    const fluidTextureSize = this._fluid.settings.TEXTURE_SIZE;
    const noiseAmount = Config.fluidNoiseAmount;
    const textureNoiseVel = generateFluidNoiseMap(
      "velocity",
      time,
      fluidTextureSize,
      noiseAmount
    );
    const textureNoiseDensity = generateFluidNoiseMap(
      "density",
      time,
      fluidTextureSize,
      noiseAmount
    );
    this._fluid.updateFlowWithMap(
      textureNoiseVel,
      textureNoiseDensity,
      Config.fluidFlowMapStrength
    );
    this._fluid.update();

    // update particles
    this._drawSim
      .bindFrameBuffer(this._fbo.write)
      .bindTexture("uPosMap", this._fbo.read.getTexture(0), 0)
      .bindTexture("uVelMap", this._fbo.read.getTexture(1), 1)
      .bindTexture("uExtraMap", this._fbo.read.getTexture(2), 2)
      .bindTexture("uDataMap", this._fbo.read.getTexture(3), 3)
      .uniform("uTime", Scheduler.getElapsedTime() + this._seedTime)
      .uniform("uSpeed", 1)
      .uniform("uTouch", [999, 999, 999])
      .uniform("uCenter", [0, 0.5, 0])
      .draw();

    this._fbo.swap();

    // update ribbon pos map
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

    const mtxInvert = mat4.invert(mat4.create(), this._hitTestor.modelMatrix);

    // disturb particles
    this._drawScramble
      .bindFrameBuffer(this._fboScrambled)
      .bindTexture("uPosMap", this._fboPos.texture, 0)
      .bindTexture("uFluidMap", this._fluid.velocity, 1)
      .bindTexture("uDensityMap", this._fluid.density, 2)
      .bindTexture('uExtraMap', this._fbo.read.getTexture(2), 3)
      .uniform("uCameraMatrix", this._hitTestor.modelMatrix)
      .uniform("uInvertMatrix", mtxInvert)
      .uniform("uTime", Scheduler.getElapsedTime() + this._seedTime)
      .uniform("uBound", bound)
      .uniform("uStrength", Config.extreme ? 10 : 1)
      .uniform("uMaxRadius", 8)
      .uniform('uNumSets', numSets)
      .draw();

    this._fboPos.bind();
    GL.clear(0, 0, 0, 0);
    this._dCopy.draw(this._fboScrambled.texture);
    this._fboPos.unbind();

    GL.enable(GL.DEPTH_TEST);

    this._updateShadowMap();

    // render scene

    GL.setMatrices(this.camera);
    this._fboRender.bind();
    GL.clear(0, 0, 0, 0);
    const bgColor = Config.bgColor.map((v) => v / 255);
    this._drawBg
      .bindTexture("uMap", this._texturePaper, 0)
      .uniform("uBgColor", bgColor)
      .draw();
    this._drawFloor
      .bindTexture("uDepthMap", this._fboShadow.depthTexture, 0)
      .uniform("uShadowMatrix", this.mtxShadow)
      .draw();

    const g = 0.05;
    // this._dBall.draw(this._hit.pos, [g, g, g], [0.6, 0.05, 0]);
    this._renderRibbon(true);

    this._fboRender.unbind();

    // generate ao map
    this._textureAO = generateAOMap(this._fboRender.depthTexture);

    // update hit test
    const mtx = mat4.create();
    mat4.rotateY(mtx, mtx, this.orbitalControl.ry.value);
    mat4.rotateX(mtx, mtx, this.orbitalControl.rx.value);
    mat4.copy(this._hitTestor.modelMatrix, mtx);
  }

  _updateShadowMap() {
    this._fboShadow.bind();
    GL.setMatrices(this._cameraLight);
    GL.clear(0, 0, 0, 0);
    this._renderRibbon(false);
    this._fboShadow.unbind();
  }

  _renderRibbon(mShadow = false) {
    const tDepth = mShadow
      ? this._fboShadow.depthTexture
      : this._fbo.read.getTexture(0);

    const ribbonColor = Config.ribbonColor.map((v) => v / 255);
    this._drawRibbon
      .bindTexture("uPosMap", this._fboScrambled.texture, 0)
      .bindTexture("uDepthMap", tDepth, 1)
      .bindTexture("uSkipColorMap", this._textureSkipColor, 2)
      .uniform("uIndex", this._index)
      .uniform("uLight", this._lightPosition)
      .uniform("uLightFalloff", Config.lightFalloff)
      .uniform("uLightFalloffStart", Config.lightFalloffStart)
      .uniform("uShadowMatrix", this.mtxShadow)
      .uniform("uTime", Scheduler.getElapsedTime())
      .uniform("uRibbonColor", ribbonColor)
      .draw();
  }

  render() {
    let g = 0.1;
    GL.clear(g, g, g, 1);
    GL.setMatrices(this.camera);

    GL.disable(GL.DEPTH_TEST);

    // this._dCopy.draw(this._fboRender.getTexture());
    this._drawCompose
      .bindTexture("uMap", this._fboRender.texture, 0)
      .bindTexture("uAOMap", this._textureAO, 1)
      .bindTexture("uLookupMap", this._textureLookup, 2)
      .uniform("uRatio", GL.aspectRatio)
      .uniform("uLookupStrength", Config.lookupStrength)
      .uniform("uVignetteStrength", Config.vignetteStrength)
      .uniform("uCornerDarkStrength", Config.cornerDarkStrength)
      .draw();

    // this._dCopy.draw(this._textureAO);
  }

  resize() {
    const pixelRatio = 1.5;
    const { innerWidth, innerHeight } = window;
    GL.setSize(innerWidth * pixelRatio, innerHeight * pixelRatio);
    this.camera?.setAspectRatio?.(GL.aspectRatio);

    // resize fbos
    this._fboRender = new FrameBuffer(GL.width, GL.height, { type: GL.FLOAT });
  }
}

export default SceneApp;
