import EventDispatcher from "events";

import { rgb, rgba } from "./utils";
import { createCanvas } from "./utils/setupProject2D";

const scale = 1;
const videoWidth = 640 * scale;
const videoHeight = 480 * scale;
const trackedIndices = [0, 9, 10];

export const POSE_FOUND = "poseFound";
export const POSE_LOST = "poseLost";

export default class PoseDetection extends EventDispatcher {
  constructor() {
    super();

    const { canvas, ctx, width, height } = createCanvas(
      videoWidth,
      videoHeight
    );
    this.canvas = canvas;
    this.ctx = ctx;
    document.body.appendChild(canvas);
    canvas.id = "pose-canvas";
    console.log(width, height);
    canvas.style.cssText = `
      position: absolute;
      right: 0;
      bottom: 0;
      width:${width / 2}px;
      height:${height / 2}px;
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
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        reject(new Error("no camera"));
      }

      const video = document.createElement("video");
      document.body.appendChild(video);
      video.className = "webcam";
      video.id = "video";
      video.setAttribute("playsinline", "");

      video.width = videoWidth;
      video.height = videoHeight;

      const onStreamFetched = (mediaStream) => {
        this.video = video;
        video.addEventListener("loadeddata", () => {
          resolve(video);
        });

        video.srcObject = mediaStream;
        video.play();
        console.log(
          "Stream fetched :",
          video.width,
          video.height,
          video.videoWidth,
          video.videoHeight
        );
      };

      let deviceId = "";
      navigator.mediaDevices
        .enumerateDevices()
        .then(function (devices) {
          const webcams = devices.filter(
            (device) => device.kind === "videoinput"
          );
          console.log("Webcams found : ", webcams.length);
          console.table(webcams);

          if (webcams.length === 1) {
            deviceId = webcams[0].deviceId;
          } else {
            const logitech = webcams.filter(
              (webcam) => webcam.label.indexOf("C920") > -1
            )[0];
            deviceId = logitech ? logitech.deviceId : webcams[0].deviceId;
          }

          window.navigator.mediaDevices
            .getUserMedia({
              video: { width: 640, height: 480, frameRate: 30, deviceId },
            })
            .then(onStreamFetched)
            .catch(function () {
              console.error("No camera available.");
            });
        })
        .catch(function (err) {
          console.log(err.name + ": " + err.message);
        });
    });
  }

  async checkPose() {
    const poses = await this.detector.estimatePoses(this.video);

    if (poses.length > 0) {
      // this.emit('pose', poses[0]);
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
    ctx.fillStyle = rgba(0, 0, 0, 0.25);
    // ctx.fillRect(0, 0, width, height);

    const dot = (x, y, r = 5) => {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    };

    keypoints.forEach(({ x, y, score }, i) => {
      if (score > 0.5) {
        const g = 255;
        ctx.fillStyle =
          trackedIndices.indexOf(i) > -1 ? rgb(200, 10, 0) : rgba(g, g, g, 0.5);
        dot(width - x, y, trackedIndices.indexOf(i) > -1 ? 8 : 4);
      }
    });
  }
}
