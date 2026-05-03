import {
  GL,
  Scene,
  DrawAxis,
  DrawCopy,
  DrawBall,
  DrawCamera,
  CameraOrtho,
  FrameBuffer,
} from "@alfrid";
import Config from "./Config";
import {
  TargetSizeStrategy,
  FullscreenStrategy,
} from "./strategies/RenderStrategy";

import DrawForest from "./DrawForest";

// utils
import { biasMatrix } from "@utils";
import { vec3, mat4 } from "gl-matrix";

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
    this.orbitalControl.rx.value = -0.5;
    this.orbitalControl.ry.value = -0.5;

    // light & shadow
    this._light = [-2, 5, 2];
    vec3.rotateY(this._light, this._light, [0, 0, 0], -0.2);
    this._cameraLight = new CameraOrtho();
    const r = 5.5;
    this._cameraLight.ortho(-r, r, -r, r, 1, 10);
    this._cameraLight.lookAt(this._light, [0, 0, 0], [0, 1, 0]);

    this._mtxShadow = mat4.create();
    mat4.mul(this._mtxShadow, biasMatrix, this._cameraLight.matrix);
  }

  _initTextures() {
    const fbo = new FrameBuffer(2, 2);
    fbo.bind();
    GL.clear(1, 0, 0, 1);
    fbo.unbind();
    this._tWhite = fbo.texture;

    this._shadowMapSize = 1024;
    this._fboShadow = new FrameBuffer(
      this._shadowMapSize,
      this._shadowMapSize,
      {
        minFilter: GL.LINEAR,
        magFilter: GL.LINEAR,
      }
    );
  }

  _initViews() {
    // utils
    this._dAxis = new DrawAxis();
    this._dCopy = new DrawCopy();
    this._dBall = new DrawBall();
    this._dCamera = new DrawCamera();

    // draws
    this._dForest = new DrawForest();
  }

  update() {
    if (this._dForest.isReady) {
      this._updateShadowMap();
    }
  }

  _updateShadowMap() {
    // Render scene from light's perspective to create shadow map
    this._fboShadow.bind();
    GL.clear(0, 0, 0, 0);
    GL.setMatrices(this._cameraLight);

    // Render the forest to the shadow map (depth only, no shadow calculation)
    this.drawPointCloud(false);

    this._fboShadow.unbind();
  }

  drawPointCloud(useShadow) {
    const tDepth = useShadow ? this._fboShadow.depthTexture : this._tWhite;

    this._dForest
      .bindTexture("uDepthMap", tDepth, 0)
      .uniform("uShadowMatrix", this._mtxShadow)
      .uniform("uShadowMapSize", [this._shadowMapSize, this._shadowMapSize])
      .uniform("uUseShadow", useShadow)
      .uniform("uViewport", [GL.width, GL.height])
      .draw();
  }

  render() {
    GL.clear(...Config.background, 1);
    GL.setMatrices(this.camera);

    let g = 0.05;

    this._dAxis.draw();
    this._dBall.draw(this._light, [g, g, g], [1, 1, 0.9]);
    this._dCamera.draw(this._cameraLight);

    const debugMaps = [];

    if (this._dForest.isReady) {
      // Render the forest with shadows
      this.drawPointCloud(true);

      this._dForest.regions.forEach((region) => {
        this._dBall.draw(region.slice(0, 3), [g, g, g], [0.8, 0.6, 0]);
      });

      // debugMaps.push(this._fboShadow.depthTexture);
    }

    g = 500;
    debugMaps.forEach((t, i) => {
      GL.viewport(g * i, 0, g, g);
      this._dCopy.draw(t);
    });
  }

  resize() {
    this.renderStrategy?.resize(this.camera);
  }
}
