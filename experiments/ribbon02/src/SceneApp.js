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
import generateBlueNoise from "./generateBlueNoise";
import applyBlur from "./applyBlur";

// pose detection
import PoseDetection, { POSE_FOUND, POSE_LOST } from "./PoseDetection";

// fluid simulation
import FluidSimulation from "./fluid-sim";
import TrackPoint2D from "./TrackPoint2D";
import TrackPoint3D from "./TrackPoint3D";

const bound = 8;

class SceneApp extends Scene {
  constructor() {
    super();

    const minRadius = 8;
    this.orbitalControl.radius.value = Config.usePoseDetection ? minRadius : 10;
    this.orbitalControl.radius.limit(minRadius, 11);
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
    const DISSIPATION = 0.98;
    this._fluid = new FluidSimulation({
      DENSITY_DISSIPATION: DISSIPATION,
      VELOCITY_DISSIPATION: DISSIPATION,
      PRESSURE_DISSIPATION: DISSIPATION,
    });

    // pose detection
    if (Config.usePoseDetection) {
      this._initPoseDetection();
    }
  }

  _initPoseDetection() {
    const ratio = GL.aspectRatio;
    this._trackedPoints = [
      new TrackPoint2D(),
      new TrackPoint2D(),
      new TrackPoint2D(),
    ];

    this._poseDetection = new PoseDetection();
    this._poseDetection.on(POSE_FOUND, (o) => {
      o.forEach((p, i) => {
        if (p.score > 0.4 && i > 0) {
          this._trackedPoints[i].update(p.pos);
          const { pos, dir, speed } = this._trackedPoints[i];
          let f = smoothstep(0.01, 0.1, speed);
          const adjPos = [pos[0], pos[1]];
          adjPos[0] = (adjPos[0] - 0.5) / ratio + 0.5;
          this._fluid.updateFlow(adjPos, dir, mix(2, 6, f), mix(2, 4, f), 1);
        }
      });

      const { canvas, video } = this._poseDetection;
      if (!canvas.classList.contains("ready")) {
        canvas.classList.add("ready");
        video.classList.add("ready");
      }
    });

    this._poseDetection.on(POSE_LOST, () => {
      this._trackedPoints.forEach((p) => p.reset());
    });
  }

  _init() {
    this.resize();

    // camera settings
    const FOV = Config.usePoseDetection ? 70 : 80;
    this.camera.setPerspective(FOV * RAD, GL.aspectRatio, 2, 20);
    this._index = 0;

    this._hit = new TrackPoint3D();

    const mesh = Geom.plane(bound * 2, bound * 2, 1);
    this._drawDebugFluid = new DrawDebugFluid(mesh);
    this._hitTestor = new HitTestor(mesh, this.camera);

    this._hitTestor.on("onHit", (e) => {
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
      .uniform("uNoiseScale", 1)
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
      .uniform("uCameraMatrix", this._hitTestor.modelMatrix)
      .uniform("uInvertMatrix", mtxInvert)
      .uniform("uTime", Scheduler.getElapsedTime() + this._seedTime)
      .uniform("uBound", bound)
      .uniform("uStrength", Config.extreme ? 10 : 1)
      .uniform("uMaxRadius", Config.usePoseDetection ? 8 : 8)
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
    this._drawBg.bindTexture("uMap", this._texturePaper, 0).draw();
    this._drawFloor
      .bindTexture("uDepthMap", this._fboShadow.depthTexture, 0)
      .uniform("uShadowMatrix", this.mtxShadow)
      .draw();

    const g = 0.05;
    this._dBall.draw(this._hit.pos, [g, g, g], [0.6, 0.05, 0]);
    this._renderRibbon(true);

    this._fboRender.unbind();

    // generate ao map
    this._textureAO = generateAOMap(this._fboRender.depthTexture);

    // generate blurred map
    this._textureBlurredRender = applyBlur(this._fboRender.texture);

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

    this._drawRibbon
      .bindTexture("uPosMap", this._fboScrambled.texture, 0)
      .bindTexture("uDepthMap", tDepth, 1)
      .uniform("uIndex", this._index)
      .uniform("uLight", this._lightPosition)
      .uniform("uShadowMatrix", this.mtxShadow)
      .uniform("uTime", Scheduler.getElapsedTime())
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
