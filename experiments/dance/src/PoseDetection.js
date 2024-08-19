import EventDispatcher from "events";

import { rgb, rgba } from "./utils";
import { createCanvas } from "./utils/setupProject2D";

const scale = 1;

const videoWidth = 960 * scale;
const videoHeight = 600 * scale;
const trackedIndices = [];
for (let i = 0; i < 17; i++) {
  trackedIndices.push(i);
}

export const POSE_FOUND = "poseFound";
export const POSE_LOST = "poseLost";

export default class PoseDetection extends EventDispatcher {
  constructor(mSource) {
    super();

    this._source = mSource;
    const { canvas, ctx, width, height } = createCanvas(
      videoWidth,
      videoHeight
    );
    this.canvas = canvas;
    this.width = width;
    this.height = height;
    this.ctx = ctx;
    document.body.appendChild(canvas);
    const w = Math.min(videoWidth, 400);
    // const w = videoWidth / 2;
    const ratio = videoWidth / videoHeight;
    const h = w / ratio;
    this.reScale = w / videoWidth;
    canvas.id = "pose-canvas";
    canvas.style.cssText = `
      position: absolute;
      right: 0;
      bottom: 0;
      width:${w}px;
      height:${h}px;
      z-index: 999;
    `;

    this.init();
  }

  async init() {
    await this._setupCamera();
    // create a new pose detector
    this.detector = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet
    );
    this.checkPose();
  }

  _setupCamera() {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      document.body.appendChild(video);
      video.id = "video";

      video.width = videoWidth;
      video.height = videoHeight;
      video.setAttribute("loop", "");

      video.src = this._source;
      video.addEventListener("loadeddata", () => {
        console.log("video loaded");
        this.video = video;
        resolve(video);
      });

      video.play();

      // Event listener for playing video on mousedown
      window.addEventListener("mousedown", () => {
        console.log("Play");
        video
          .play()
          .then(() => {
            console.log("Video is playing");
          })
          .catch((error) => {
            console.error("Error playing the video:", error);
          });
      });
    });
  }

  async checkPose() {
    const poses = await this.detector.estimatePoses(this.video);

    if (poses.length > 0) {
      // this.emit("pose", poses[0]);
      const points = trackedIndices.map((i) => {
        const { x, y, score } = poses[0].keypoints[i];
        return {
          pos: [(videoWidth - x) / videoWidth, 1 - y / videoHeight],
          score,
        };
      });

      this.emit(POSE_FOUND, points);

      this.debugPose(poses[0]);
    } else {
      this.emit(POSE_LOST);
    }

    requestAnimationFrame(() => this.checkPose());
  }

  debugPose({ keypoints }) {
    const { ctx, canvas } = this;
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = rgba(255, 0, 0, 0.25);
    ctx.fillRect(0, 0, width, height);

    const dot = (x, y, r = 5) => {
      ctx.beginPath();
      ctx.arc(x, y, r / this.reScale, 0, Math.PI * 2);
      ctx.fill();
    };

    keypoints.forEach(({ x, y, score }, i) => {
      if (score > 0.25) {
        const g = 255;
        ctx.fillStyle =
          trackedIndices.indexOf(i) > -1 ? rgb(200, 10, 0) : rgba(g, g, g, 0.5);
        dot(x, y, 4);
      }
    });
  }
}
