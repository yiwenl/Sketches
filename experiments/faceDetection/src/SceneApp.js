import { GL, DrawBall, DrawAxis, DrawCopy, Scene } from "alfrid";
import { random, saveImage, getDateString } from "./utils";
import Config from "./Config";

import FaceDetection, { FACE_DETECTED } from "./FaceDetection";
import { vec3 } from "gl-matrix";

// draw calls
import DrawLine from "./DrawLine";
import DrawFace from "./DrawFace";

const faceMeshScale = 0.03;

let hasSaved = false;
let canSave = false;

class SceneApp extends Scene {
  constructor() {
    super();

    // this.orbitalControl.lock();

    this._pointNose = [0, 0, 0];
    this._pointCenter = [0, 0, 0];

    this._dir = [0, 0, 5];

    FaceDetection.init();
    FaceDetection.on(FACE_DETECTED, this.onFaceDetected);

    setTimeout(() => {
      canSave = true;
    }, 500);
  }

  onFaceDetected = (mFace) => {
    const { keypoints } = mFace;

    const getAdjustedPoint = (p) => {
      return [p.x - 320, -(p.y - 240), -p.z].map((v) => v * faceMeshScale);
    };

    const getAdjustedPointByIndex = (index) => {
      return getAdjustedPoint(keypoints[index]);
    };

    const noseIndex = 4;
    this._pointNose = getAdjustedPointByIndex(noseIndex);

    const pa = getAdjustedPointByIndex(93);
    const pb = getAdjustedPointByIndex(323);
    vec3.add(this._pointCenter, pa, pb);
    vec3.scale(this._pointCenter, this._pointCenter, 0.5);

    vec3.sub(this._dir, this._pointNose, this._pointCenter);
    vec3.normalize(this._dir, this._dir);
    vec3.scale(this._dir, this._dir, 5);
    vec3.add(this._dir, this._dir, this._pointNose);

    const vertices = keypoints.map(getAdjustedPoint);
    this._drawFace.update(vertices);
  };

  _initTextures() {
    this.resize();
  }

  _initViews() {
    this._dAxis = new DrawAxis();
    this._dCopy = new DrawCopy();
    this._dBall = new DrawBall();
    this._drawFace = new DrawFace();
    this._drawLine = new DrawLine();
  }

  update() {}

  render() {
    let g = 0.1;
    GL.clear(g, g, g, 1);
    GL.setMatrices(this.camera);

    this._dAxis.draw();

    g = 2;
    this._drawLine.draw(this._pointCenter, this._dir, [1, 1, 0]);

    g = 0.05;
    this._dBall.draw(this._pointNose, [g, g, g], [1, 0, 0]);

    g = 0.1;
    this._dBall.draw(this._pointCenter, [g, g, g], [1, 1, 1]);
    this._drawFace.uniform("uAlpha", 0.5).draw();

    if (canSave && !hasSaved && Config.autoSave) {
      saveImage(GL.canvas, getDateString());
      hasSaved = true;
    }
  }

  resize() {
    const { innerWidth, innerHeight } = window;
    const pixelRatio = 1;
    GL.setSize(innerWidth * pixelRatio, innerHeight * pixelRatio);
    this.camera.setAspectRatio(GL.aspectRatio);
  }
}

export default SceneApp;
