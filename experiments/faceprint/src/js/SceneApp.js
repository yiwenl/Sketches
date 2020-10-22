// SceneApp.js

import alfrid, { Scene, GL } from "alfrid";
import Assets from "./Assets";
import Settings from "./Settings";
import Config from "./Config";
import { resize } from "./utils";
import FaceDetection from "./FaceDetection";
import { TRIANGULATION } from "./triangulation";
import { mat4, vec3, mat3 } from "gl-matrix";
import DebugCamera from "debug-camera";
import getCharTexture from "./getCharTexture";

//  draw calls
import DrawPlanes from "./DrawPlanes";
import DrawPassingPlanes from "./DrawPassingPlanes";
import DrawEdge from "./DrawEdge";
import DrawBlocks from "./DrawBlocks";
import DrawFloatingChars from "./DrawFloatingChars";

// textures
import TextureBlocks from "./TextureBlocks";

//  shaders
import vs from "shaders/face.vert";
import fs from "shaders/face.frag";

const INDEX_NOSE = 1;
const INDEX_NOSE_BASE = 2;

class SceneApp extends Scene {
  constructor() {
    super();
    GL.enableAlphaBlending();
    this.orbitalControl.radius.value = 4;
    this.orbitalControl.lock();

    this._faceDetection = new FaceDetection();
    this._faceDetection.init();

    this._pNose = vec3.create();
    this._pNoseTarget = vec3.create();
    this._mtx = mat4.create();
    this._mtxRotateInvert = mat3.create();
    this._mtxNose = mat4.create();
    this._dir = vec3.fromValues(0, 0, 1);
    this._isClosing = false;
    this._isLocked = false;

    this._mtxFront = mat4.create();

    this._offsetOpen = new alfrid.EaseNumber(0, 0.05);
    this._offset = new alfrid.TweenNumber(1, "linear", 0.005);
    this._offsetColor = new alfrid.EaseNumber(1, 0.05);
    this._prevColor = Config.colorMap;
    this._currentColor = Config.colorMap;
    this._seed = Math.random() * 0xff;

    this._cameraFront = new alfrid.CameraOrtho();
    const s = 3;
    this._cameraFront.ortho(-s, s, s, -s, 0.5, 4);

    this._faceDetection.on("onMeshUpdate", (o) => this._onMeshUpdate(o));
    this._faceDetection.on("onShake", () => this._onShake());
    this.resize();
    this._textureChars = getCharTexture();

    window.addEventListener("keydown", (e) => {
      if (e.key === "d") {
        Config.debug = !Config.debug;
        Settings.refresh();

        document.body.classList.remove("debug");
        if (Config.debug) {
          document.body.classList.add("debug");
        }
      } else if (e.key === " ") {
        this._onShake();
      }
    });
  }

  _initTextures() {
    console.log("init textures");

    const fboSize = 512;
    const oSettings = {
      type: GL.FLOAT,
    };
    this._fboDepth = new alfrid.FrameBuffer(fboSize, fboSize, oSettings, 2);
    this._fboEdge = new alfrid.FrameBuffer(fboSize, fboSize);

    this._textureBlocks = new TextureBlocks();
  }

  _initViews() {
    console.log("init views");

    this._bCopy = new alfrid.BatchCopy();
    this._bAxis = new alfrid.BatchAxis();
    this._bBall = new alfrid.BatchBall();
    this._bLine = new alfrid.BatchLine();

    this._drawPlanes = new DrawPlanes();
    this._drawPassing = new DrawPassingPlanes();
    this._drawBlocks = new DrawBlocks();
    this._drawEdge = new DrawEdge();
    this._drawFloating = new DrawFloatingChars();
    this._drawEdge.setClearColor(0, 0, 0, 0).bindFrameBuffer(this._fboEdge);
  }

  _onShake() {
    if (this._isLocked) {
      return;
    }
    this._isLocked = true;
    document.body.classList.add("hideDesc");
    this._seed = Math.random() * 0xff;
    const duratoion = 4000;
    this._offset.value = 1;
    this._isClosing = true;

    setTimeout(() => {
      // next colour
      this._isClosing = false;
      let nextColor = Config.colorMap + 1;
      this._prevColor = this._currentColor;
      if (nextColor >= 10) {
        nextColor = 0;
      }
      Config.colorMap = nextColor;
      this._currentColor = nextColor;
      this._offsetColor.setTo(0);
      this._offsetColor.value = 1;

      this._seed = Math.random() * 0xff;
      this._offset.value = 0;
    }, duratoion);

    setTimeout(() => {
      // unlock shaking
      this._faceDetection.unlock();
      this._isLocked = false;
    }, duratoion * 2);
  }

  _onMeshUpdate(o) {
    const { points } = o;

    // get nose
    vec3.copy(this._pNose, points[INDEX_NOSE]);
    const dir = vec3.clone(points[INDEX_NOSE_BASE]);
    vec3.sub(dir, this._pNose, dir);
    vec3.normalize(dir, dir);

    vec3.lerp(this._dir, this._dir, dir, 0.1);
    vec3.copy(dir, this._dir);
    vec3.add(this._pNoseTarget, this._pNose, dir);

    // get matrix
    const up = vec3.fromValues(0, 0, 1);
    const axis = vec3.create();
    vec3.cross(axis, dir, up);
    const dotValue = vec3.dot(dir, up);
    const angle = -Math.acos(dotValue);
    const mtxRotate = mat4.create();
    mat4.rotate(mtxRotate, mtxRotate, angle, axis);

    mat3.fromMat4(this._mtxRotateInvert, mtxRotate);
    mat3.invert(this._mtxRotateInvert, this._mtxRotateInvert);

    if (!this._pTip) {
      this._pTip = vec3.clone(this._pNose);
    } else {
      vec3.lerp(this._pTip, this._pTip, this._pNose, 0.2);
    }

    mat4.identity(this._mtxNose, this._mtxNose);
    mat4.translate(this._mtxNose, this._mtxNose, this._pTip);
    mat4.mul(this._mtxNose, this._mtxNose, mtxRotate);

    this._cameraFront.lookAt(this._pNoseTarget, this._pNose);
    mat4.mul(
      this._mtxFront,
      this._cameraFront.projection,
      this._cameraFront.matrix
    );

    if (!this._drawFace) {
      this.mesh = new alfrid.Mesh();
      this.mesh.bufferVertex(points);
      this.mesh.bufferIndex(TRIANGULATION);

      this._drawFace = new alfrid.Draw()
        .setMesh(this.mesh)
        .useProgram(vs, fs)
        .bindFrameBuffer(this._fboDepth)
        .setClearColor(0, 0, 0, 0);

      this._open();
    } else {
      this.mesh.bufferVertex(points);
    }
  }

  _open() {
    // open animation
    document.body.classList.remove("isLoading");
    this._offsetOpen.value = 1;
    this._offset.value = 0;
    this._faceDetection.unlock();
  }

  update() {
    if (!this._drawFace) return;
    GL.rotate(this._mtx);
    GL.setMatrices(this._cameraFront);
    GL.cullFace(GL.FRONT);
    this._drawFace.draw();
    GL.cullFace(GL.BACK);

    this._drawEdge
      .uniformTexture("texture", this._fboDepth.getTexture(0), 0)
      .uniform("uWidth", "float", Config.edgeWidth)
      .draw();

    this._textureBlocks.update();
  }

  render() {
    GL.clear(0, 0, 0, 1);

    GL.setMatrices(this.camera);
    GL.rotate(this._mtxNose);

    if (Config.debug) {
      this._bAxis.draw();
    }

    this._drawPlanes
      .uniformTexture("texturePos", this._fboDepth.getTexture(0), 0)
      .uniformTexture("textureLight", this._fboDepth.getTexture(1), 1)
      .uniformTexture("textureChar", this._textureChars, 2)
      .uniformTexture("textureColor", Assets.get(`00${Config.colorMap}`), 3)
      .uniformTexture("textureNoise", Assets.get(`noise`), 4)
      .uniform("uFrontMatrix", "mat4", this._mtxFront)
      .uniform("uRotateInvertMatrix", "mat3", this._mtxRotateInvert)
      .uniform("uNum", "float", 12)
      .uniform("uScale", "float", Config.planeScale * this._offsetOpen.value)
      .uniform("uShadowStrength", "float", Config.shadowStrength)
      .uniform("uOffset", "float", this.offset)
      .uniform("uSeed", "float", this._seed)
      .draw();

    this._drawBlocks
      .uniformTexture("texture", this._textureBlocks.texture, 0)
      .uniformTexture("textureMask", this._fboEdge.texture, 1)
      .uniformTexture("texturePrev", Assets.get(`00${this._prevColor}`), 2)
      .uniformTexture("textureCurr", Assets.get(`00${this._currentColor}`), 3)
      .uniform("uFrontMatrix", "mat4", this._mtxFront)
      .uniform("uScale", "float", this._offsetOpen.value)
      .uniform("uOffset", "float", this._offsetColor.value)
      .draw();

    // console.log(this._prevColor, this._currentColor, this._offsetColor.value);
    this._drawFloating
      .uniformTexture("textureChar", this._textureChars, 0)
      .uniformTexture("texturePrev", Assets.get(`00${this._prevColor}`), 1)
      .uniformTexture("textureCurr", Assets.get(`00${this._currentColor}`), 2)
      .uniformTexture("textureNoise", Assets.get(`noise`), 3)
      .uniform("uViewport", "vec2", [GL.width, GL.height])
      .uniform("uTime", "float", alfrid.Scheduler.deltaTime)
      .uniform("uOffset", "float", this._offsetColor.value)
      .draw();

    if (!this._isClosing) {
      GL.enableAdditiveBlending();
      GL.disable(GL.DEPTH_TEST);
      this._drawPassing
        .uniformTexture("texturePos", this._fboDepth.getTexture(0), 0)
        .uniformTexture("textureLight", this._fboDepth.getTexture(1), 1)
        .uniformTexture("textureChar", this._textureChars, 2)
        .uniformTexture("textureColor", Assets.get(`00${Config.colorMap}`), 3)
        .uniformTexture("textureNoise", Assets.get(`noise`), 4)
        .uniform("uFrontMatrix", "mat4", this._mtxFront)
        .uniform("uRotateInvertMatrix", "mat3", this._mtxRotateInvert)
        .uniform("uNum", "float", 12)
        .uniform("uTime", "float", alfrid.Scheduler.deltaTime)
        .uniform("uScale", "float", Config.planeScale * this._offsetOpen.value)
        .uniform("uShadowStrength", "float", Config.shadowStrength)
        .uniform("uOffset", "float", this.offset)
        .uniform("uSeed", "float", this._seed)
        .draw();
      GL.enableAlphaBlending();
      GL.enable(GL.DEPTH_TEST);
    }

    if (Config.debug) {
      DebugCamera(this._cameraFront);

      const w = 300;
      const h = w;
      GL.viewport(0, 0, w, h);
      this._bCopy.draw(this._fboDepth.getTexture(0));
      GL.viewport(w, 0, w, h);
      this._bCopy.draw(this._fboDepth.getTexture(1));
      GL.viewport(w * 2, 0, w, h);
      this._bCopy.draw(this._fboEdge.texture);
    }
  }

  resize(w, h) {
    resize(w, h);
    this.camera.setAspectRatio(GL.aspectRatio);
  }

  get offset() {
    return this._offset.value;
  }
}

export default SceneApp;
