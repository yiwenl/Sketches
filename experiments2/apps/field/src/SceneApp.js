import {
  GL,
  Scene,
  DrawAxis,
  DrawCopy,
  DrawBall,
  DrawCamera,
  CameraPerspective,
  FrameBuffer,
} from "@alfrid";
import { mat4 } from "gl-matrix";
import Config from "./Config";
import {
  TargetSizeStrategy,
  FullscreenStrategy,
} from "./strategies/RenderStrategy";

import GrassTile from "./GrassTile";
import generateCurlMap from "./generateCurlMap";
import { FIELD_SIZE, TILE_SIZE, LOD_NEAR, LOD_FAR } from "./Constants";

const COLOR_NEAR = [0.4, 1.0, 0.4];
const COLOR_MID = [1.0, 1.0, 0.4];
const COLOR_FAR = [1.0, 0.4, 0.4];

export default class SceneApp extends Scene {
  constructor() {
    super();

    // Choose strategy based on configuration
    this.renderStrategy = Config.useTargetSize
      ? new TargetSizeStrategy()
      : new FullscreenStrategy();

    // Initialize with the chosen strategy
    this.renderStrategy.init(GL.canvas);
  }

  _init() {
    this.orbitalControl.rx.value = -0.7;
    this.orbitalControl.ry.value = -0.3;
    this.orbitalControl.radius.value = 40;

    const shiftMatrix = mat4.create();
    mat4.translate(shiftMatrix, shiftMatrix, [0, -2, 0]);
    this.orbitalControl.updateShiftMatrix(shiftMatrix);

    const fov = (60 * Math.PI) / 180;
    this.camera.setPerspective(fov, GL.aspectRatio, 0.1, 1000);
    // test camera
    this._cameraTest = new CameraPerspective();
    this._cameraTest.setPerspective(fov, GL.aspectRatio, 0.1, 1000);
    this._cameraTest.lookAt([30, 15, -50], [0, 0, 0]);
  }

  _initTextures() {
    // this._texture = Assets.get("test");
    this._fbo = new FrameBuffer(GL.width, GL.height, {
      type: GL.FLOAT,
    });
  }

  _initViews() {
    this._dAxis = new DrawAxis();
    this._dCopy = new DrawCopy();
    this._dBall = new DrawBall();
    this._dCamera = new DrawCamera();

    this._tiles = [];
    const numTiles = Math.round((FIELD_SIZE * 2) / TILE_SIZE); // 10
    const start = -FIELD_SIZE + TILE_SIZE / 2;

    for (let row = 0; row < numTiles; row++) {
      for (let col = 0; col < numTiles; col++) {
        const cx = start + col * TILE_SIZE;
        const cz = start + row * TILE_SIZE;
        this._tiles.push(new GrassTile(cx, cz));
      }
    }
  }

  update() {
    this._mapCurl = generateCurlMap();
    this._fbo.bind();
    GL.clear(...Config.background, 1);
    GL.setMatrices(this._cameraTest);
    this._drawGrass();
    this._fbo.unbind();
  }

  _drawGrass() {
    // Extract _cameraTest world position for LOD classification
    const camPos = this._cameraTest.position;
    GL.disable(GL.CULL_FACE);
    for (const tile of this._tiles) {
      const dx = tile.cx - camPos[0];
      const dz = tile.cz - camPos[2];
      const dist = Math.sqrt(dx * dx + dz * dz);

      const { maxFloorHeight } = Config;
      if (dist < LOD_NEAR) {
        tile.drawHigh(1, COLOR_NEAR, this._mapCurl, FIELD_SIZE, maxFloorHeight);
      } else if (dist < LOD_FAR) {
        const uOffset = 1 - (dist - LOD_NEAR) / (LOD_FAR - LOD_NEAR);
        tile.drawHigh(
          uOffset,
          COLOR_MID,
          this._mapCurl,
          FIELD_SIZE,
          maxFloorHeight,
        );
      } else {
        tile.drawLow(COLOR_FAR, this._mapCurl, FIELD_SIZE, maxFloorHeight);
      }
    }
    GL.enable(GL.CULL_FACE);
  }

  render() {
    GL.clear(...Config.background, 1);
    const camera = Config.viewFromCamera ? this._cameraTest : this.camera;
    GL.setMatrices(camera);

    this._dAxis.draw();
    this._dCamera.draw(this._cameraTest, [1, 0.75, 0.5]);

    this._drawGrass();
    GL.disable(GL.DEPTH_TEST);
    const w = 1000;
    GL.viewport(0, 0, w, w / GL.aspectRatio);
    this._dCopy.draw(this._fbo.texture);
    GL.viewport(w, 0, w / GL.aspectRatio, w / GL.aspectRatio);
    this._dCopy.draw(this._mapCurl);
    GL.enable(GL.DEPTH_TEST);
  }

  resize() {
    this.renderStrategy?.resize(this.camera);
  }
}
