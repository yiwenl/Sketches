import {
  GL,
  DrawBall,
  DrawAxis,
  DrawCopy,
  Scene,
  FrameBuffer,
  FboPingPong,
  CameraOrtho,
  TweenNumber,
  HitTestor,
} from "alfrid";
import {
  iOS,
  RAD,
  mix,
  random,
  randomInt,
  toGlsl,
  biasMatrix,
  smoothstep,
} from "./utils";
import Config from "./Config";
import Assets from "./Assets";
import Scheduler from "scheduling";
import { vec2, vec3, mat4 } from "gl-matrix";
import resize from "./utils/resize";

// pose detection
import PoseDetection, { POSE_FOUND, POSE_LOST } from "./PoseDetection";

// fluid simulation
import FluidSimulation from "./fluid-sim";

// draw calls
import DrawFluid from "./DrawFluid";
import DrawSave from "./DrawSave";
import DrawBlocks from "./DrawBlocks";
import DrawSim from "./DrawSim";
import DrawReflection from "./DrawReflection";
import DrawChroma from "./DrawChroma";
import DrawBg from "./DrawBg";
import DrawDirection from "./DrawDirection";
import DrawCompose from "./DrawCompose";

// utils
import generateNormalMap from "./generateNormalMap";
import generateAOMap from "./generateAOMap";
import generateBlueNoise from "./generateBlueNoise";
import generatePaperTexture from "./generatePaperTexture";
import { availableRatio } from "./features";

let isMobile = false;

class SceneApp extends Scene {
  constructor() {
    super();

    this.orbitalControl.lock();
    this.camera.setPerspective(45 * RAD, GL.aspectRatio, 10, 20);

    const ratioIndex = availableRatio.indexOf(Config.ratio);
    const zoom = [10, 15, 12];
    let _zoom = zoom[ratioIndex];
    if (!Config.useTargetRatio) {
      _zoom = 10;
    }
    console.log("zoom", _zoom);
    this.orbitalControl.radius.setTo(_zoom);

    // fluid
    this._fluid = new FluidSimulation({
      DENSITY_DISSIPATION: 0.99,
      VELOCITY_DISSIPATION: 0.98,
      PRESSURE_DISSIPATION: 0.98,
    });

    // shadow
    this._cameraLight = new CameraOrtho();
    const r = 8;
    this._lightPosition = [0, 7, 3];
    vec3.rotateX(this._lightPosition, this._lightPosition, [0, 0, 0], 0.3);
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

    // animation
    this._offset = new TweenNumber(0, "linear", 0.005);
    this._theta = 0;
    this._rotation = 0;
    this._numEmit = 6;
    this._rotateDir = 1;
    this._rotateOffsets = [];

    for (let i = 0; i < this._numEmit; i++) {
      this._rotateOffsets.push(random(-1, 1) * 0.75);
    }
    this.pulse();

    // interaction
    this._hit = [0, 0, 0];
    this._preHit = [0, 0, 0];

    if (Config.usePoseDetection) {
      this._initPoseDetection();
    }

    this.frame = 0;
  }

  pulse() {
    this._rotateDir *= -1;
    this._offset.setTo(0);
    this._offset.value = 1;
    this._theta = random(Math.PI * 2);
    this._rotation = randomInt(3) * 0.25;

    this._numEmit = isMobile ? randomInt(3, 6) : randomInt(3, 9);
    this._rotateOffsets = [];
    const rotateLimit = random();
    for (let i = 0; i < this._numEmit; i++) {
      this._rotateOffsets.push(random(-1, 1) * rotateLimit);
    }

    setTimeout(() => this.pulse(), 3000);
  }

  _initPoseDetection() {
    this._poseDetection = new PoseDetection();
    this._poseDetection.on(POSE_FOUND, this._onPoseFound);
    this._poseDetection.on(POSE_LOST, () => {
      // this._flowForce.value = 1;
    });
  }

  _onPoseFound = (mPoints) => {
    if (!this._posePoints || this._posePoints.length !== mPoints.length) {
      this._posePoints = mPoints.map(({ pos }) => pos);
    } else {
      const threshold = 0.5;
      mPoints.forEach(({ pos, score }, i) => {
        const dir = vec2.sub([0, 0], pos, this._posePoints[i]);
        let speed = vec2.length(dir);
        let f = smoothstep(0.01, 0.03, speed);
        vec2.normalize(dir, dir);
        let _pos = vec2.clone(pos);
        if (Config.mirrored) {
          _pos[0] = 1 - _pos[0];
        }

        if (score > threshold && f > 0) {
          const radius = mix(2, 2.5, f);
          const force = mix(2, 20, f);
          this._fluid.updateFlow(_pos, dir, force, radius, 0.5);
        }
        vec2.copy(this._posePoints[i], pos);
      });
    }
  };

  _initTextures() {
    isMobile = GL.isMobile;

    this.resize();

    this._texturePaper = generatePaperTexture();
    this._textureLookup = Assets.get("lookup");
    this._textureLookup.minFilter = GL.NEAREST;
    this._textureLookup.magFilter = GL.NEAREST;

    const { numParticles: num } = Config;
    // alert("Num Particles: " + num);
    const type = iOS() ? GL.HALF_FLOAT_OES : GL.FLOAT;
    const oSettings = {
      minFilter: GL.NEAREST,
      magFilter: GL.NEAREST,
      type,
    };

    this._fbo = new FboPingPong(num, num, oSettings, 4);
    this._fboPosOrg = new FrameBuffer(num, num, oSettings);

    this._fboRender = new FrameBuffer(GL.width, GL.height);
    this._fboPost = new FrameBuffer(GL.width, GL.height);

    this._fboFluid = new FrameBuffer(
      GL.width,
      GL.height,
      { type, minFilter: GL.LINEAR, magFilter: GL.LINEAR },
      2
    );

    let fboSize = isMobile ? 1024 : 2048;
    this._fboShadow = new FrameBuffer(fboSize, fboSize);
    this._fboShadow.bind();
    GL.clear(0, 0, 0, 0);
    this._fboShadow.unbind();

    // blue noise
    this._textureNoise = generateBlueNoise();

    if (isMobile) {
      const fbo = new FrameBuffer(2, 2);
      fbo.bind();
      GL.clear(1, 1, 1, 1);
      fbo.unbind();
      this._textureAO = fbo.texture;
    }
  }

  _initViews() {
    this._dAxis = new DrawAxis();
    this._dCopy = new DrawCopy();
    this._dBall = new DrawBall();
    this._drawBg = new DrawBg();
    this._drawCompose = new DrawCompose();

    this._drawFluid = new DrawFluid().bindFrameBuffer(this._fboFluid);

    new DrawSave().bindFrameBuffer(this._fbo.read).draw();
    this._fboPosOrg.bind();
    GL.clear(0, 0, 0, 1);
    this._dCopy.draw(this._fbo.read.getTexture(0));
    this._fboPosOrg.unbind();

    this._drawBlocks = new DrawBlocks();
    this._drawSim = new DrawSim();
    this._drawReflection = new DrawReflection();
    this._drawChroma = new DrawChroma();
    this._drawDirection = new DrawDirection();

    // hitTestor
    const { meshSize } = this._drawFluid;
    const s = meshSize / 2;
    this._hitTestor = new HitTestor(this._drawFluid.mesh, this.camera);
    if (!isMobile) {
      this._hitTestor.on("onHit", (e) => {
        // console.log("onHit", isMobile);
        vec3.copy(this._preHit, this._hit);
        vec3.copy(this._hit, e.hit);

        const d = vec3.distance(this._preHit, this._hit);
        const f = smoothstep(0.01, 0.1, d);
        const pos = [
          (this._hit[0] / s) * 0.5 + 0.5,
          (this._hit[1] / s) * 0.5 + 0.5,
        ];
        const dir = [
          this._hit[0] - this._preHit[0],
          this._hit[1] - this._preHit[1],
        ];

        const strength = mix(5.0, 10.0, f) * 2;
        const radius = mix(1.0, 2.0, f);
        this._fluid.updateFlow(pos, dir, strength, radius, 0.81);
      });
    }
  }

  update() {
    this.frame++;

    let updateMaps = false;
    if (isMobile) {
      if (this.frame % 2 === 1) {
        updateMaps = true;
      }
    } else {
      updateMaps = true;
    }

    GL.setMatrices(this.camera);

    if (random() < 0.05 && Config.randomMovements) {
      // console.log("random movement");
      const pos = [random(0.1, 0.3), 0];
      const dir = [0, 1];
      const a = this.frame * 0.1;
      vec2.rotate(pos, pos, [0, 0], a);
      vec2.rotate(dir, dir, [0, 0], random(Math.PI * 2));
      vec2.add(pos, pos, [0.5, 0.5]);
      let str = random(10, 30) * isMobile ? 0.7 : 1;
      this._fluid.updateFlow(pos, dir, str, random(3, 5), 1);
    }
    this._updateFluid();

    // update normal map

    // update particles

    let f = Math.sin(this._offset.value * Math.PI);
    this._drawSim
      .bindFrameBuffer(this._fbo.write)
      .bindTexture("uPosMap", this._fbo.read.getTexture(0), 0)
      .bindTexture("uVelMap", this._fbo.read.getTexture(1), 1)
      .bindTexture("uExtraMap", this._fbo.read.getTexture(2), 2)
      .bindTexture("uDataMap", this._fbo.read.getTexture(3), 3)
      .bindTexture("uPosOrgMap", this._fboPosOrg.texture, 4)
      .bindTexture("uFluidMap", this._fboFluid.getTexture(0), 5)
      .bindTexture("uDensityMap", this._fboFluid.getTexture(1), 6)
      .uniform("uTime", Scheduler.getElapsedTime())
      .uniform("uOffset", f)
      .uniform("uLifeDecrease", this._offset.value < 1 ? 0 : 1)
      .uniform("uSpeed", GL.isMobile ? 0.4 : 1.0)
      .draw();

    this._fbo.swap();

    // render shadow map
    if (updateMaps) {
      this._updateShadowMap();
      this._textureNormal = generateNormalMap(this._fboFluid.getTexture(1));
    }

    // render
    this._fboRender.bind();
    let g = 0.95;
    GL.clear(g, g, g, 1);
    GL.setMatrices(this.camera);
    GL.disable(GL.DEPTH_TEST);
    // this._dCopy.draw(this._texturePaper);
    this._drawBg
      .bindTexture("uMap", this._texturePaper, 0)
      .uniform("uRatio", GL.aspectRatio)
      .draw();
    GL.enable(GL.DEPTH_TEST);
    this._renderBlocks(true);
    this._fboRender.unbind();

    // render ao map
    // if (!isMobile) {
    this._textureAO = generateAOMap(this._fboRender.depthTexture, this.camera);
    // }
  }

  _updateFluid() {
    const num = this._numEmit;
    const { sin, PI } = Math;
    let r = 0.1;
    const time = this._theta;
    let f = sin(this._offset.value * PI);
    f = smoothstep(0.0, 0.8, f);
    f = Math.pow(f, 2) * 0.2;
    if (GL.isMobile) f *= 0.25;
    const noise = 1;
    const angle = this._rotation * f;

    for (let i = 0; i < num; i++) {
      const rotateOffset = this._rotateOffsets[i] || 0;
      const a = (i / num) * PI * 2 + time + rotateOffset;
      let pos = [r, 0];
      let dir = [1, 0];
      pos = vec2.rotate(pos, pos, [0, 0], a);
      vec2.add(pos, pos, [0.5, 0.5]);
      vec2.rotate(dir, dir, [0, 0], a + angle * this._rotateDir);

      const radius = random(1.5, 2);
      const strength = random(0.75, 1) * f;
      this._fluid.updateFlow(pos, dir, strength, radius, noise);
    }

    r = 0.2;
    // num = 8;
    for (let i = 0; i < num; i++) {
      const rotateOffset = this._rotateOffsets[i] || 0;
      const a = ((i + 0.5) / num) * PI * 2 - time + rotateOffset;
      let pos = [r + random(-1, 1) * 0.1, 0];
      let dir = [-1, 0];
      pos = vec2.rotate(pos, pos, [0, 0], a);
      vec2.add(pos, pos, [0.5, 0.5]);
      vec2.rotate(dir, dir, [0, 0], a + angle * this._rotateDir);

      const radius = random(1, 1.5);
      const strength = random(0.75, 1) * f;
      this._fluid.updateFlow(pos, dir, strength, radius, noise);
    }

    this._fluid.update();

    // draw fluid map
    this._drawFluid
      .bindTexture("uDensityMap", this._fluid.density, 0)
      .bindTexture("uVelocityMap", this._fluid.velocity, 1)
      .draw();
  }

  _updateShadowMap() {
    this._fboShadow.bind();
    GL.clear(0, 0, 0, 1);
    GL.setMatrices(this._cameraLight);
    this._renderBlocks(false);
    this._fboShadow.unbind();
  }

  _renderBlocks(mShadow = false) {
    const tDepth = mShadow
      ? this._fboShadow.depthTexture
      : this._fboPosOrg.texture;

    this._drawBlocks
      .bindTexture("uPosMap", this._fbo.read.getTexture(0), 0)
      .bindTexture("uVelMap", this._fbo.read.getTexture(1), 1)
      .bindTexture("uDataMap", this._fbo.read.getTexture(3), 2)
      .bindTexture("uDepthMap", tDepth, 3)
      .bindTexture("uNoiseMap", this._textureNoise, 4)
      .uniform("uShadowMatrix", this.mtxShadow)
      .uniform("uLight", this._lightPosition)
      .uniform("uResolution", [GL.width, GL.height])
      .uniform("uColorHighlight", Config.colorHighlight.map(toGlsl))
      .uniform("uColorShadow", Config.colorShadow.map(toGlsl))
      .uniform("uColorDiffuse", Config.colorDiffuse.map(toGlsl))
      .draw();
  }

  render() {
    let g = 0.1;
    GL.clear(g, g, g, 1);
    GL.setMatrices(this.camera);
    if (isMobile && 0) {
      GL.disable(GL.DEPTH_TEST);
      this._dCopy.draw(this._fboRender.texture);
      // this._drawDirection
      //   .bindTexture("uMap", this._fluid.velocity, 0)
      //   .bindTexture("uDensityMap", this._fluid.density, 1)
      //   .uniform("uTime", Scheduler.getElapsedTime())
      //   .draw();

      GL.enable(GL.DEPTH_TEST);
      return;
    }

    this._fboPost.bind();
    GL.clear(0, 0, 0, 1);
    GL.disable(GL.DEPTH_TEST);

    this._drawChroma
      .bindTexture("uMap", this._fboRender.texture, 0)
      .bindTexture("uNormalMap", this._textureNormal, 1)
      .bindTexture("uAOMap", this._textureAO, 2)
      .bindTexture("uLookupMap", this._textureLookup, 3)
      .uniform("uColorAO", Config.colorAO.map(toGlsl))
      .uniform("uRatio", GL.aspectRatio)
      .uniform("uSeparation", Config.colorSeparation)
      .draw();
    // this._dCopy.draw(this._textureNormal);
    this._drawDirection
      .bindTexture("uMap", this._fluid.velocity, 0)
      .bindTexture("uDensityMap", this._fluid.density, 1)
      .uniform("uTime", Scheduler.getElapsedTime())
      .draw();

    if (!isMobile) {
      GL.enableAdditiveBlending();
      this._drawReflection
        .bindTexture("uNormalMap", this._textureNormal, 0)
        .uniform("uColor", Config.colorReflection0.map(toGlsl))
        .uniform("uLight", [0.3, 0.1, 1.0])
        .draw();

      this._drawReflection
        .bindTexture("uNormalMap", this._textureNormal, 0)
        .uniform("uColor", Config.colorReflection1.map(toGlsl))
        .uniform("uLight", [-0.3, 0.0, 1.0])
        .draw();
      GL.enableAlphaBlending();
    }

    this._fboPost.unbind();

    if (isMobile && 0) {
      this._dCopy.draw(this._fboPost.texture);
    } else {
      this._drawCompose
        .bindTexture("uMap", this._fboPost.texture, 0)
        .bindTexture("uLookupMap", this._textureLookup, 1)
        .bindTexture("uNoiseMap", this._textureNoise, 2)
        .uniform("uRatio", GL.aspectRatio)
        .uniform("uLutStrength", Config.lutStrength)
        .draw();
    }

    GL.enable(GL.DEPTH_TEST);
  }

  resize() {
    const { ratio, useTargetRatio, pixelRatio: _pixelRatio } = Config;
    const pixelRatio = GL.isMobile ? 1 : _pixelRatio;

    if (useTargetRatio) {
      const ratios = ratio.split(":");
      const w = parseInt(ratios[0]);
      const h = parseInt(ratios[1]);
      let width, height;
      if (w > h) {
        width = 1920;
        height = (width / w) * h;
      } else {
        height = 1920;
        width = (height / h) * w;
      }

      GL.setSize(width, height);
      resize(GL.canvas, width, height);
    } else {
      const { innerWidth, innerHeight } = window;
      GL.setSize(innerWidth * pixelRatio, innerHeight * pixelRatio);
    }

    this.camera?.setAspectRatio?.(GL.aspectRatio);

    this._fboRender = new FrameBuffer(GL.width, GL.height);
    this._fboPost = new FrameBuffer(GL.width, GL.height);
  }
}

export default SceneApp;
