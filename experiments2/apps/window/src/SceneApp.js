import {
  GL,
  Scene,
  DrawAxis,
  DrawCopy,
  DrawBall,
  DrawCamera,
  FrameBuffer,
  FboPingPong,
  CameraOrtho,
} from "@alfrid";
import { biasMatrix } from "@utils";
import { vec3, mat4 } from "gl-matrix";
import Config from "./Config";
import {
  TargetSizeStrategy,
  FullscreenStrategy,
} from "./strategies/RenderStrategy";
import DrawSave from "./DrawSave";
import DrawSim from "./DrawSim";
import DrawBlocks from "./DrawBlocks";
import DrawForest from "./DrawForest";
import Scheduler from "scheduling";
import FluidManager from "./FluidManager";
import Walls from "./Walls";

const SHADOW_MAP_RATIO = 1 / 2;

export default class SceneApp extends Scene {
  constructor() {
    super();

    // const map = Assets.get()

    // Choose strategy based on configuration
    this.renderStrategy = Config.useTargetSize
      ? new TargetSizeStrategy()
      : new FullscreenStrategy();

    // Initialize with the chosen strategy
    this.renderStrategy.init(GL.canvas);
  }

  _init() {
    const fov = (75 * Math.PI) / 180;
    this.camera.setPerspective(fov, GL.aspectRatio, 0.1, 100);

    // camera
    const r = 0.2;
    // this.orbitalControl.rx.limit(-r, r);
    // this.orbitalControl.ry.limit(-r, r);
    // this.orbitalControl.ry.value = -0.1;
    this.orbitalControl.radius.value = 6;
    this.orbitalControl.radius.limit(5, 20);

    // fluid
    FluidManager.init();

    // light
    this._light = [0, 5, 2];
    vec3.rotateX(this._light, this._light, [0, 0, 0], 0.25);
    this._cameraLight = new CameraOrtho();
    const w = 8;
    const h = w * SHADOW_MAP_RATIO;

    this._cameraLight.ortho(-w, w, -h, h, 1, 10);
    this._cameraLight.lookAt(this._light, [0, 0, 0], [0, 1, 0]);

    // shadow matrix
    this._mtxShadow = mat4.create();
    mat4.multiply(
      this._mtxShadow,
      this._cameraLight.projectionMatrix,
      this._cameraLight.viewMatrix
    );
    mat4.multiply(this._mtxShadow, biasMatrix, this._mtxShadow);

    // forest shadow map camera (larger viewbox)
    this._cameraLightForest = new CameraOrtho();
    const wForest = 24 * 5;
    const hForest = wForest * SHADOW_MAP_RATIO;
    this._cameraLightForest.ortho(-wForest, wForest, -hForest, hForest, 1, 50);
    this._cameraLightForest.lookAt(this._light, [0, 0, 0], [0, 1, 0]);

    // forest shadow matrix
    this._mtxShadowForest = mat4.create();
    mat4.multiply(
      this._mtxShadowForest,
      this._cameraLightForest.projectionMatrix,
      this._cameraLightForest.viewMatrix
    );
    mat4.multiply(this._mtxShadowForest, biasMatrix, this._mtxShadowForest);
  }

  _initTextures() {
    const { numParticles: num } = Config;
    const oSettings = {
      minFilter: GL.NEAREST,
      magFilter: GL.NEAREST,
      wrapS: GL.CLAMP_TO_EDGE,
      wrapT: GL.CLAMP_TO_EDGE,
      type: GL.FLOAT,
    };
    this._fbo = new FboPingPong(num, num, oSettings, 4);

    this._fboWhite = new FrameBuffer(2, 2);
    this._fboWhite.bind();
    GL.clear(1, 1, 1, 1);
    this._fboWhite.unbind();

    // shadow map
    const w = 2048;
    const h = w * SHADOW_MAP_RATIO;
    this._fboShadow = new FrameBuffer(w, h);

    // forest shadow map
    this._fboShadowForest = new FrameBuffer(w, h);
    this._forestShadowRendered = false;
  }

  _initViews() {
    this._dAxis = new DrawAxis();
    this._dCopy = new DrawCopy();
    this._dBall = new DrawBall();
    this._dCamera = new DrawCamera();

    this._walls = new Walls();

    this._dSim = new DrawSim();

    new DrawSave()
      .bindFrameBuffer(this._fbo.read)
      .setClearColor(0, 0, 0, 1)
      .draw();

    this._dBlocks = new DrawBlocks();
    this._dForest = new DrawForest();

    // Render forest shadow map once (static geometry)
    this._renderForestShadowMap();
  }

  update() {
    this._dSim
      .bindFrameBuffer(this._fbo.write)
      .bindTexture("uPosMap", this._fbo.read.getTexture(0), 0)
      .bindTexture("uVelMap", this._fbo.read.getTexture(1), 1)
      .bindTexture("uExtraMap", this._fbo.read.getTexture(2), 2)
      .bindTexture("uDataMap", this._fbo.read.getTexture(3), 3)
      .bindTexture("uFluidMap", FluidManager.velocity, 4)
      .bindTexture("uDensityMap", FluidManager.density, 5)
      .uniform("uBound", 10)
      .uniform("uTime", Scheduler.getTime() * 0.001)
      .draw();

    this._fbo.swap();

    this.updateShadowMap();

    // fluid
    FluidManager.update();
  }

  updateShadowMap() {
    GL.setMatrices(this._cameraLight);
    this._fboShadow.bind();
    GL.clear(0, 0, 0, 1);
    this._renderParticles(false);
    this._fboShadow.unbind();
  }

  _renderForestShadowMap() {
    if (this._forestShadowRendered) return;

    GL.setMatrices(this._cameraLightForest);
    this._fboShadowForest.bind();
    GL.clear(0, 0, 0, 1);

    // Render forest with model matrix
    let mtx = mat4.create();
    const { scale, x, y, z } = Config.pointCloud;
    mat4.translate(mtx, mtx, [x, y, z]);
    mat4.scale(mtx, mtx, [scale, scale, scale]);
    GL.setModelMatrix(mtx);

    // Render forest (without shadow map itself, just depth)
    this._dForest
      .uniform("uViewport", [GL.width, GL.height])
      .uniform("uFogStart", Config.fog.start)
      .uniform("uFogEnd", Config.fog.end)
      .uniform("uZCutoff", Config.fog.zCutoff)
      .draw();

    this._fboShadowForest.unbind();
    this._forestShadowRendered = true;
  }

  _renderParticles(mShadow) {
    const tDepth = mShadow
      ? this._fboShadow.depthTexture
      : this._fboWhite.texture;

    this._dBlocks
      .bindTexture("uPosMap", this._fbo.read.getTexture(0), 0)
      .bindTexture("uVelMap", this._fbo.read.getTexture(1), 1)
      .bindTexture("uDepthMap", tDepth, 2)
      .uniform("uShadowMatrix", this._mtxShadow)
      .uniform("uLight", this._light)
      .draw();
  }

  render() {
    let mtx = mat4.create();
    const { scale, x, y, z } = Config.pointCloud;
    mat4.translate(mtx, mtx, [x, y, z]);
    mat4.scale(mtx, mtx, [scale, scale, scale]);
    const bgColor = [...Config.background];
    GL.clear(...bgColor, 1);
    GL.setMatrices(this.camera);

    let g = 0.1;

    this._walls
      .uniform(
        "uColor",
        bgColor.map((c) => c + 0.005)
      )
      .draw();

    GL.setModelMatrix(mtx);

    // Calculate normalized light direction
    const lightDir = vec3.create();
    vec3.normalize(lightDir, this._light);

    this._dForest
      .bindTexture("uDepthMap", this._fboShadowForest.depthTexture, 0)
      .uniform("uViewport", [GL.width, GL.height])
      .uniform("uFogStart", Config.fog.start)
      .uniform("uFogEnd", Config.fog.end)
      .uniform("uZCutoff", Config.fog.zCutoff)
      .uniform("uShadowMatrix", this._mtxShadowForest)
      .uniform("uLight", lightDir)
      .draw();

    mat4.identity(mtx);
    GL.setModelMatrix(mtx);
    this._renderParticles(true);

    g = 512;
    GL.viewport(0, 0, g, g);
    this._dCopy.draw(FluidManager.velocity);
    GL.viewport(g, 0, g, g);
    this._dCopy.draw(FluidManager.density);
  }

  resize() {
    this.renderStrategy?.resize(this.camera);
  }
}
