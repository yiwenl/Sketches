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
  EaseNumber,
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

// textures
import generatePaperTexture from "./generatePaperTexture";
import generateAOMap from "./generateAOMap";
import generateBlueNoise from "./generateBlueNoise";
import applyBlur from "./applyBlur";

// hand detection
import HandPoseDetection, {
  ON_VIDEO_READY,
  ON_HANDS_LOST,
  ON_HANDS_DETECTED,
} from "./hand-detection";

// fluid simulation
import FluidSimulation from "./fluid-sim";

const bound = 8;
const debug = true;

class SceneApp extends Scene {
  constructor() {
    super();

    // this.orbitalControl.lock();
    // this.orbitalControl.lockZoom(true);
    this.orbitalControl.radius.value = 10;
    this.orbitalControl.radius.limit(8, 11);
    this.orbitalControl.rx.limit(0.2, -1.0);
    const a = 1.5;
    this.orbitalControl.ry.limit(-a, a);

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
    const DISSIPATION = 0.99;
    this._fluid = new FluidSimulation({
      DENSITY_DISSIPATION: DISSIPATION,
      VELOCITY_DISSIPATION: DISSIPATION,
      PRESSURE_DISSIPATION: DISSIPATION,
    });

    // pose detection
    if (Config.useHandDetection) {
      this._initHandDetection();
    }
  }

  _initHandDetection() {
    console.log("Init hand detection");

    const videoScale = 1;
    const targetWidth = 360 * videoScale;
    const targetHeight = 240 * videoScale;

    this._handLeft = [999, 999];
    this._handLeftPrev = [999, 999];
    this._handRight = [999, 999];
    this._handRightPrev = [999, 999];

    this._handDetection = new HandPoseDetection(targetWidth, targetHeight, 1);
    this._handDetection.on(ON_VIDEO_READY, this._onVideoReady);
    this._handDetection.on(ON_HANDS_DETECTED, this._onHandsDetected);
    this._handDetection.on(ON_HANDS_LOST, this._onHandsLost);

    this._handDetection.displayScale = 0.75;
  }

  _onVideoReady = () => {};

  _onHandsDetected = (hands) => {
    const { width, height } = this._handDetection;

    hands.forEach((handTrack) => {
      const { keypoints, handedness, score } = handTrack;

      if (score > 0.8) {
        const hand = this[`_hand${handedness}`];
        const handPrev = this[`_hand${handedness}Prev`];
        const wrist = keypoints.find((k) => k.name === "wrist");
        const x = 1 - wrist.x / width;
        const y = 1 - wrist.y / height;

        if (hand[0] > 900) {
          hand[0] = x;
          hand[1] = y;
          handPrev[0] = x;
          handPrev[1] = y;
        } else {
          vec2.copy(handPrev, hand);
          hand[0] = x;
          hand[1] = y;

          const dir = vec2.sub([], hand, handPrev);
          let f = vec2.distance(hand, handPrev);
          if (f < 0.05) {
            f = smoothstep(0, 0.02, f);
            f = Math.pow(f, 1.5);

            this._fluid.updateFlow(hand, dir, 6 * f, 2, 1);
          }
        }
      }
    });
  };

  _onHandsLost = () => {
    this._handLeft = [999, 999];
    this._handLeftPrev = [999, 999];
    this._handRight = [999, 999];
    this._handRightPrev = [999, 999];
  };

  _init() {
    this.resize();

    // camera settings
    this.camera.setPerspective(80 * RAD, GL.aspectRatio, 2, 20);
    this._index = 0;

    this._hit = [999, 999, 999];
    this._preHit = [999, 999, 999];

    const mesh = Geom.plane(bound * 2, bound * 2, 1);
    // const mesh = Geom.sphere(3, 24);
    const hitTestor = new HitTestor(mesh, this.camera);
    hitTestor.on("onHit", (e) => {
      if (this._preHit[0] === 999) {
        vec3.copy(this._preHit, e.hit);
      } else {
        vec3.copy(this._preHit, this._hit);
      }
      vec3.copy(this._hit, e.hit);

      let x = (this._hit[0] / bound) * 0.5 + 0.5;
      let y = (this._hit[1] / bound) * 0.5 + 0.5;
      const dir = vec3.sub([], this._hit, this._preHit);
      const _dir = [dir[0], dir[1]];
      const d = vec2.length(_dir);
      let f = smoothstep(0, 0.3, d);
      vec2.normalize(_dir, _dir);
      let radius = mix(1.0, 3.0, f) * Config.extreme ? 1 : 2;
      this._fluid.updateFlow([x, y], _dir, f * 0.2, radius, 1);
    });

    hitTestor.on("onUp", (e) => {
      this._hit = [999, 999, 999];
      this._preHit = [999, 999, 999];
    });

    this._seedTime = random(1000);

    // shadow
    let r = 15;
    this._lightPosition = [0.0, 10, 0.1];
    vec3.rotateX(this._lightPosition, this._lightPosition, [0, 0, 0], 0.3);
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
    this._textureLookup = Assets.get("lookup");
    this._textureLookup.minFilter = GL.NEAREST;
    this._textureLookup.magFilter = GL.NEAREST;

    const { numParticles: num, numSets } = Config;
    const oSettings = {
      minFilter: GL.NEAREST,
      magFilter: GL.NEAREST,
      type: GL.FLOAT,
    };
    this._fbo = new FboPingPong(num, num, oSettings, 4);

    // blue noise
    this._textureNoise = generateBlueNoise();

    // position array
    let fboSize = num * numSets;
    this._fboPos = new FrameBuffer(fboSize, fboSize, oSettings);
    this._fboScrambled = new FrameBuffer(fboSize, fboSize, oSettings);

    this._fboRender = new FrameBuffer(GL.width, GL.height);

    fboSize = 2048;
    this._fboShadow = new FrameBuffer(fboSize, fboSize, {
      minFilter: GL.LINEAR,
      magFilter: GL.LINEAR,
    });

    fboSize = 1024;
    this._fboFlow = new FboPingPong(fboSize, fboSize, {
      type: GL.FLOAT,
      minFilter: GL.LINEAR,
      magFilter: GL.LINEAR,
    });

    this._fboFlow.read.bind();
    GL.clear(0, 0, 0, 1);
    this._fboFlow.read.unbind();
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

  _initPoseDetection() {}

  update() {
    this._fluid.update();
    this._updateFlow();

    this._drawSim
      .bindFrameBuffer(this._fbo.write)
      .bindTexture("uPosMap", this._fbo.read.getTexture(0), 0)
      .bindTexture("uVelMap", this._fbo.read.getTexture(1), 1)
      .bindTexture("uExtraMap", this._fbo.read.getTexture(2), 2)
      .bindTexture("uDataMap", this._fbo.read.getTexture(3), 3)
      .uniform("uTime", Scheduler.getElapsedTime() + this._seedTime)
      .uniform("uSpeed", 1)
      // .uniform("uTouch", this._hit)
      .uniform("uTouch", [999, 999, 999])
      .uniform("uNoiseScale", 1)
      .uniform("uCenter", [0, 0.5, 0])
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

    this._drawScramble
      .bindFrameBuffer(this._fboScrambled)
      .bindTexture("uPosMap", this._fboPos.texture, 0)
      // .bindTexture("uFluidMap", this._fboFlow.read.texture, 1)
      .bindTexture("uFluidMap", this._fluid.velocity, 1)
      .bindTexture("uDensityMap", this._fluid.density, 2)
      .uniform("uTime", Scheduler.getElapsedTime() + this._seedTime)
      .uniform("uBound", bound)
      .uniform("uStrength", Config.extreme ? 10 : 1)
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
    // GL.clear(1, 1, 1, 1);
    GL.clear(0, 0, 0, 0);
    this._drawBg.bindTexture("uMap", this._texturePaper, 0).draw();
    this._drawFloor
      .bindTexture("uDepthMap", this._fboShadow.depthTexture, 0)
      .uniform("uShadowMatrix", this.mtxShadow)
      .draw();

    const g = 0.02;
    this._dBall.draw(this._hit, [g, g, g], [0.6, 0.05, 0]);
    this._renderRibbon(true);

    this._fboRender.unbind();

    // generate ao map
    this._textureAO = generateAOMap(this._fboRender.depthTexture);

    // generate blurred map
    this._textureBlurredRender = applyBlur(this._fboRender.texture);
  }

  _updateFlow() {
    this._drawFlowUpdate
      .bindFrameBuffer(this._fboFlow.write)
      .bindTexture("uMap", this._fboFlow.read.texture, 0)
      .draw();

    this._fboFlow.swap();
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

    this._drawRibbon
      .bindTexture("uPosMap", this._fboScrambled.texture, 0)
      .bindTexture("uDepthMap", tDepth, 1)
      .uniform("uIndex", this._index)
      .uniform("uLight", this._lightPosition)
      .uniform("uShadowMatrix", this.mtxShadow)
      .uniform("uTime", Scheduler.getElapsedTime())
      .uniform("uTouch", this._hit)
      .draw();
  }

  render() {
    let g = 0.1;
    GL.clear(g, g, g, 1);
    GL.setMatrices(this.camera);

    GL.disable(GL.DEPTH_TEST);
    const { near, far } = this.camera;
    let focus = (this.orbitalControl.radius.value + 3.2 - near) / (far - near);

    // this._dCopy.draw(this._fboRender.getTexture());
    this._drawCompose
      .bindTexture("uMap", this._fboRender.texture, 0)
      .bindTexture("uAOMap", this._textureAO, 1)
      .bindTexture("uNoiseMap", this._textureNoise, 2)
      .bindTexture("uLookupMap", this._textureLookup, 3)
      .bindTexture("uBlurMap", this._textureBlurredRender, 4)
      .bindTexture("uDepthMap", this._fboRender.depthTexture, 5)
      .uniform("uFocus", focus)
      .uniform("uRatio", GL.aspectRatio)
      .uniform("uNear", near)
      .uniform("uFar", far)
      .draw();

    if (debug && this._handLeft) {
      g = 0.05;
      let x = this._handLeft[0] * 2 - 1;
      let y = this._handLeft[1] * 2 - 1;

      this._dBall.draw([x * bound, y * bound, 0], [g, g, g], [1, 0, 0]);

      x = this._handRight[0] * 2 - 1;
      y = this._handRight[1] * 2 - 1;

      this._dBall.draw([x * bound, y * bound, 0], [g, g, g], [1, 0, 0]);

      // g = 400;
      // GL.viewport(0, 0, g, g);
      // this._dCopy.draw(this._fluid.velocity);
      // GL.viewport(g, 0, g, g);
      // this._dCopy.draw(this._fluid.density);
    }
  }

  resize() {
    const pixelRatio = 1.5;
    const { innerWidth, innerHeight } = window;
    GL.setSize(innerWidth * pixelRatio, innerHeight * pixelRatio);
    this.camera?.setAspectRatio?.(GL.aspectRatio);

    // resize fbos
    this._fboRender = new FrameBuffer(GL.width, GL.height);

    // console.log(GL.aspectRatio, 9 / 16);
    console.log(GL.aspectRatio, 4 / 5);
  }
}

export default SceneApp;
