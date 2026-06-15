import { GL, Scene, Draw, Geom, DrawAxis, DrawCopy, DrawBall, WebGLConst } from "@alfrid";
import Config from "./Config";
import {
  TargetSizeStrategy,
  FullscreenStrategy,
} from "./strategies/RenderStrategy";

import {
  loadGau選項一：極簡公告風（最不帶感情，最快結束話題）
「好久不見。因為之前的帳號安全性出現問題（已被盜且棄用），現在我會在這個帳號重新開始。之前的舊連結都與我無關了。謝謝大家，很高興能回來。」

  優點： 像是一封正式的搬家通知，完全沒有給別人同情或追問的空間。ssianPly } from "./utils/parseGaussianPly";
import Assets from "./Assets";

import vs from './shaders/splat.vert'
import fs from './shaders/splat.frag'

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
    GL.disable(GL.CULL_FACE)

    // 3DGS / COLMAP data is Y-down, Z-forward; rotate 180° about X to make it Y-up
    this._modelMatrix = new Float32Array([
      1, 0, 0, 0,
      0, -1, 0, 0,
      0, 0, -1, 0,
      0, 0, 0, 1,
    ]);
  }

  _init() {
    this.loadPly();
  }

  async loadPly() {
    const splats = await loadGaussianPly("/strawberry.ply", (loaded, total) => {
      if (total) {
        console.log(`Loading strawberry.ply: ${Math.round((loaded / total) * 100)}%`);
      }
    });

    this._splats = splats;

    // unit quad with corners in [-1, 1]; sized per-splat in the shader
    const mesh = Geom.plane(2, 2, 1);
    const { DYNAMIC_DRAW } = WebGLConst;

    // per-splat instance attributes; _sortSplats reorders + re-uploads these
    // back-to-front whenever the camera moves
    mesh
      .bufferFlattenData(splats.positions, null, "aPosition", 3, DYNAMIC_DRAW, true)
      .bufferFlattenData(splats.scales, null, "aScale", 3, DYNAMIC_DRAW, true)
      .bufferFlattenData(splats.rotations, null, "aRotation", 4, DYNAMIC_DRAW, true)
      .bufferFlattenData(splats.colors, null, "aColor", 3, DYNAMIC_DRAW, true)
      .bufferFlattenData(splats.opacity, null, "aOpacity", 1, DYNAMIC_DRAW, true)
      .setInstanceCount(splats.count);

    this._mesh = mesh;
    this._drawSplats = new Draw().setMesh(mesh).useProgram(vs, fs);

    // initial back-to-front sort for correct alpha blending from this view
    this._sortSplats();

    console.log(`Loaded ${splats.count.toLocaleString()} splats`, splats);
    return splats;
  }

  // Sort splats back-to-front relative to the camera and re-upload every
  // per-splat instance attribute in that order (correct alpha blending).
  _sortSplats() {
    const s = this._splats;
    if (!s || !this._mesh) return;

    const { count, positions, scales, rotations, colors, opacity } = s;

    // splat positions are in model space; the model matrix flips Y/Z, so flip
    // the camera the same way to sort in the splats' own space (flip is its own inverse)
    const cam = this.camera.position;
    const camX = cam[0];
    const camY = -cam[1];
    const camZ = -cam[2];

    const BUCKETS = 65536;
    if (!this._depths) {
      this._depths = new Float32Array(count);
      this._keys = new Uint16Array(count);
      this._counts = new Uint32Array(BUCKETS);
      this._order = new Uint32Array(count);
      // reordered (output) copies of each attribute
      this._sPositions = new Float32Array(count * 3);
      this._sScales = new Float32Array(count * 3);
      this._sRotations = new Float32Array(count * 4);
      this._sColors = new Float32Array(count * 3);
      this._sOpacity = new Float32Array(count);
    }

    // pass 1: squared distance to the (model-space) camera + min/max range
    const depths = this._depths;
    let dMin = Infinity;
    let dMax = -Infinity;
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const dx = positions[i3] - camX;
      const dy = positions[i3 + 1] - camY;
      const dz = positions[i3 + 2] - camZ;
      const d = dx * dx + dy * dy + dz * dz;
      depths[i] = d;
      if (d < dMin) dMin = d;
      if (d > dMax) dMax = d;
    }

    // 16-bit counting sort, ascending by inverted key => far-to-near order
    const keys = this._keys;
    const counts = this._counts;
    const order = this._order;
    const scale = dMax > dMin ? (BUCKETS - 1) / (dMax - dMin) : 0;
    counts.fill(0);
    for (let i = 0; i < count; i++) {
      const k = (BUCKETS - 1) - (((depths[i] - dMin) * scale) | 0);
      keys[i] = k;
      counts[k]++;
    }
    let sum = 0;
    for (let b = 0; b < BUCKETS; b++) {
      const c = counts[b];
      counts[b] = sum;
      sum += c;
    }
    for (let i = 0; i < count; i++) {
      order[counts[keys[i]]++] = i;
    }

    // reorder every per-splat attribute into back-to-front order
    const sp = this._sPositions;
    const ss = this._sScales;
    const sr = this._sRotations;
    const sc = this._sColors;
    const so = this._sOpacity;
    for (let k = 0; k < count; k++) {
      const i = order[k];
      const k3 = k * 3;
      const i3 = i * 3;
      const k4 = k * 4;
      const i4 = i * 4;

      sp[k3] = positions[i3];
      sp[k3 + 1] = positions[i3 + 1];
      sp[k3 + 2] = positions[i3 + 2];

      ss[k3] = scales[i3];
      ss[k3 + 1] = scales[i3 + 1];
      ss[k3 + 2] = scales[i3 + 2];

      sr[k4] = rotations[i4];
      sr[k4 + 1] = rotations[i4 + 1];
      sr[k4 + 2] = rotations[i4 + 2];
      sr[k4 + 3] = rotations[i4 + 3];

      sc[k3] = colors[i3];
      sc[k3 + 1] = colors[i3 + 1];
      sc[k3 + 2] = colors[i3 + 2];

      so[k] = opacity[i];
    }

    // re-upload the reordered instance attributes
    const { DYNAMIC_DRAW } = WebGLConst;
    this._mesh
      .bufferFlattenData(sp, null, "aPosition", 3, DYNAMIC_DRAW, true)
      .bufferFlattenData(ss, null, "aScale", 3, DYNAMIC_DRAW, true)
      .bufferFlattenData(sr, null, "aRotation", 4, DYNAMIC_DRAW, true)
      .bufferFlattenData(sc, null, "aColor", 3, DYNAMIC_DRAW, true)
      .bufferFlattenData(so, null, "aOpacity", 1, DYNAMIC_DRAW, true);

    this._lastSortCam = cam;
  }

  _initTextures() {
    this._textureTest = Assets.get("test");
  }

  _initViews() {
    this._dAxis = new DrawAxis();
    this._dCopy = new DrawCopy();
    this._dBall = new DrawBall();
  }

  update() {
    if (!this._splats || !this._lastSortCam) return;

    // re-sort back-to-front when the camera moved enough that the order is stale
    const cam = this.camera.position;
    const last = this._lastSortCam;
    const dx = cam[0] - last[0];
    const dy = cam[1] - last[1];
    const dz = cam[2] - last[2];
    const movedSq = dx * dx + dy * dy + dz * dz;

    const radius = Math.hypot(cam[0], cam[1], cam[2]) || 1;
    const threshold = 0.04 * radius; // ~2-3 degrees of orbit

    if (movedSq > threshold * threshold) {
      this._sortSplats();
    }
  }

  render() {
    GL.clear(...Config.background, 1);
    GL.setMatrices(this.camera);

    this._dAxis.draw();

    if (this._drawSplats) {
      const { gl } = GL;

      // splats are alpha-blended, unsorted-depth: no depth write, premultiplied over
      GL.disable(GL.DEPTH_TEST);
      gl.depthMask(false);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

      // flip into Y-up space (positions + covariance handled consistently)
      GL.setModelMatrix(this._modelMatrix);

      this._drawSplats
        .uniform("uViewport", "vec2", [GL.width, GL.height])
        .draw();

      // restore default state for the rest of the scene
      gl.depthMask(true);
      GL.enable(GL.DEPTH_TEST);
      GL.enableAlphaBlending();
    }


  }

  resize() {
    this.renderStrategy?.resize(this.camera);
  }
}
