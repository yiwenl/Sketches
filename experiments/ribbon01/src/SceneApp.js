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

// particles
import DrawSave from "./DrawSave";
import DrawParticles from "./DrawParticles";
import DrawSim from "./DrawSim";
import DrawRibbon from "./DrawRibbon";
import DrawCover from "./DrawCover";
import DrawBackground from "./DrawBackground";
import DrawFloor from "./DrawFloor";
import DrawCompose from "./DrawCompose";
import DrawGrid from "./DrawGrid";

import generateBlueNoise from "./generateBlueNoise";
import generateBg from "./generateBg";
import applyBlur from "./applyBlur";

class SceneApp extends Scene {
  constructor() {
    super();
    // this.orbitalControl.lock();

    this.orbitalControl.radius.value = 6.5;
    // this.orbitalControl.radius.value = 4.5;
    this.orbitalControl.radius.limit(4.5, 7);
    this.camera.setPerspective(90 * RAD, GL.aspectRatio, 0.1, 100);

    // shadow
    let r = 5;
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
    // this._initHit();

    this.speed = new EaseNumber(1, 0.08);
    this.lengthScale = new EaseNumber(1, 0.1);
    this.noiseScale = 1;
    this.pulse();

    this._length = 0;
  }

  pulse() {
    this.speed.setTo(20);

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
      ns = randomInt(2, 6) * 0.3;
    } while (ns === this.noiseScale);
    this.noiseScale = ns + d * 1.5;

    const delay = pick([0, 250]);

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

    setTimeout(() => this.pulse(), 2500 + delay);
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

    // blur bg
    this._textureBg = generateBg(this._textureColor);

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
    this._drawCompose = new DrawCompose();
    this._drawGrid = new DrawGrid();

    // init particles
    new DrawSave().bindFrameBuffer(this._fbo.read).draw();
    this._drawSim = new DrawSim();
    this._drawParticles = new DrawParticles();
    this._drawRibbon = new DrawRibbon();
  }

  _initHit() {
    this._hitTestor = new HitTestor(Geom.sphere(3, 24), this.camera);
    this._hitTestor.on("onHit", (e) => {
      vec3.copy(this._hit, e.hit);
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
      .bindTexture("uColorMap", this._textureColor, 2)
      .uniform("uIndex", this._index)
      .uniform("uLight", this._lightPosition)
      .uniform("uShadowMatrix", this.mtxShadow)
      .uniform("uColor", getMonoColor(1))
      .uniform("uTime", Scheduler.getElapsedTime())
      .uniform("uLengthOffset", this.lengthScale.value)
      // .uniform("uLengthOffset", this._length)
      .draw();
  }

  render() {
    let applyPost =
      this.orbitalControl.radius.value < 6 && Config.usePostEffect;
    let g = 0.91;
    GL.clear(...getMonoColor(g), 1);
    GL.setMatrices(this.camera);
    GL.disable(GL.DEPTH_TEST);

    if (applyPost) {
      this._fboRender.bind();
      GL.clear(0, 0, 0, 0);
    }
    // this._dCopy.draw(this._textureBg);
    this._drawBackground
      .bindTexture("uMap", this._textureBg, 0)
      .uniform("uRatio", GL.aspectRatio)
      .draw();
    GL.enable(GL.DEPTH_TEST);
    g = 0.2;

    this._drawGrid.draw();

    this._drawFloor
      .bindTexture("uDepthMap", this._fboShadowFloor.depthTexture, 0)
      .uniform("uShadowMatrix", this.mtxShadowFloor)
      .draw();

    this._renderRibbon(true);

    this._drawParticles
      .bindTexture("uPosMap", this._fbo.read.getTexture(0), 0)
      .bindTexture("uColorMap", this._textureColor, 1)
      .uniform("uViewport", [GL.width, GL.height])
      .draw();

    if (applyPost) {
      this._fboRender.unbind();
      this._textureBlurredRender = applyBlur(this._fboRender.texture);
      this._drawCompose
        .bindTexture("uMap", this._fboRender.texture, 0)
        .bindTexture("uBlurMap", this._textureBlurredRender, 1)
        .uniform("uRatio", GL.aspectRatio)
        .draw();
    }

    GL.disable(GL.DEPTH_TEST);
    this._drawCover
      .bindTexture("uMap", this._textureNoise, 0)
      .uniform("uRatio", GL.aspectRatio)
      .draw();

    // debug
    // g = 1024 / 2;
    // GL.enable(GL.DEPTH_TEST);
  }

  resize() {
    const pixelRatio = 1.5;
    const { innerWidth, innerHeight } = window;
    GL.setSize(innerWidth * pixelRatio, innerHeight * pixelRatio);
    this.camera?.setAspectRatio?.(GL.aspectRatio);
    this._fboRender = new FrameBuffer(GL.width, GL.height);
  }
}

export default SceneApp;
