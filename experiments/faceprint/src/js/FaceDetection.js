import EventDispatcher from "events";

import Config from "./Config";
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";
import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";

const state = {
  backend: "webgl",
  maxFaces: 1,
  triangulateMesh: true,
  predictIrises: false,
};

const drawPoint = (ctx, p) => {
  const x = Math.floor(p[0]);
  const y = Math.floor(p[1]);
  ctx.beginPath();
  ctx.arc(x, y, 1, 0, 2 * Math.PI);
  ctx.fill();
};

const INDEX_NOSE = 1;
const INDEX_NOSE_BASE = 2;
const THRESHOLD = 1.5;
const THRESHOLD_COUNT = 15;

class FaceDetection extends EventDispatcher {
  async init() {
    this.canvasDebug = document.createElement("canvas");
    this.ctx = this.canvasDebug.getContext("2d");
    const VIDEO_SIZE = Config.videoSize;

    document.body.appendChild(this.canvasDebug);
    this.canvasDebug.className = "canvas-debug";
    this.canvasDebug.width = this.canvasDebug.height = VIDEO_SIZE;
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    this.ctx.fillRect(0, 0, VIDEO_SIZE, VIDEO_SIZE);
    await tf.setBackend(state.backend);
    await this.setupCamera();
    const { video } = this;
    video.play();
    this.videoWidth = video.videoWidth;
    this.videoHeight = video.videoHeight;
    video.width = this.videoWidth;
    video.height = this.videoHeight;

    this._shakeCount = 0;
    this._preNoseX = 0;
    this._isLocked = true;

    this.model = await faceLandmarksDetection.load(
      faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
      { maxFaces: state.maxFaces }
    );

    this.renderPrediction();
  }

  async setupCamera() {
    const VIDEO_SIZE = Config.videoSize;
    this.video = document.querySelector("video");
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: "user",
        // Only setting the video to a specified size in order to accommodate a
        // point cloud, so on mobile devices accept the default size.
        width: VIDEO_SIZE,
        height: VIDEO_SIZE,
      },
    });
    this.video.srcObject = stream;

    return new Promise((resolve) => {
      this.video.onloadedmetadata = () => {
        console.log("video loaded");
        resolve(this.video);
      };
    });
  }

  unlock() {
    this._isLocked = false;
  }

  async renderPrediction() {
    const VIDEO_SIZE = Config.videoSize;

    const predictions = await this.model.estimateFaces({
      input: this.video,
      returnTensors: false,
      flipHorizontal: false,
      predictIrises: state.predictIrises,
    });

    this.ctx.clearRect(0, 0, VIDEO_SIZE, VIDEO_SIZE);
    this.ctx.fillStyle = "yellow";
    const { videoSize } = Config;
    const videoScale = 500 / videoSize;
    const scale = 0.01 * videoScale;

    if (predictions.length > 0) {
      const prediction = predictions[0];
      const keypoints = prediction.scaledMesh;
      for (let i = 0; i < keypoints.length; i++) {
        drawPoint(this.ctx, keypoints[i]);
      }

      const points = keypoints.map((p) => {
        const x = -(p[0] - videoSize / 2) * scale;
        const y = -(p[1] - videoSize / 2) * scale;
        const z = (-p[2] * scale * 2.0) / videoScale;
        return [x, y, z];
      });

      this.emit("onMeshUpdate", { points });

      const pNose = keypoints[INDEX_NOSE];
      const dx = Math.abs(this._preNoseX - pNose[0]);

      if (dx > THRESHOLD && !this._isLocked) {
        if (this._shakeCount++ > THRESHOLD_COUNT) {
          this._shakeCount = 0;
          this.emit("onShake");

          this._isLocked = true;
        }
      } else {
        this._shakeCount--;
        this._shakeCount = Math.max(this._shakeCount, 0);
      }

      this._preNoseX = pNose[0];
    } else {
      console.log("detecting faces ... ");
    }

    this.rafID = requestAnimationFrame(() => this.renderPrediction());
    // Scheduler.next(() => this.renderPrediction());
  }
}

export default FaceDetection;
