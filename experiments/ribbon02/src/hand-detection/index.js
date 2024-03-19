import Emitter from "events";
import * as handPoseDetection from "@tensorflow-models/hand-pose-detection";
import JointPairs from "./JointPairs";
import { EaseNumber } from "alfrid";

export const ON_VIDEO_READY = "ON_VIDEO_READY";
export const ON_HANDS_DETECTED = "ON_HANDS_DETECTED";
export const ON_HANDS_LOST = "ON_HANDS_LOST";

export default class HandPoseDetection extends Emitter {
  constructor(mWidth = 360, mHeight = 270, mDisplayScale = 1) {
    super();
    this.width = mWidth;
    this.height = mHeight;
    this.displayScale = mDisplayScale;
    this.opacity = new EaseNumber(0.2, 0.05);

    this.initHandDetection();

    // device list
    this.decivesList = [];
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      console.log("enumerateDevices() not supported.");
    } else {
      // List cameras and microphones.
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          this.devices = devices.filter((d) => d.kind === "videoinput");
          this.deviceNames = this.devices.map((d) => d.label);
          this.deviceIds = this.devices.map((d) => d.deviceId);
        })
        .catch((err) => {
          console.log(`${err.name}: ${err.message}`);
        });
    }
  }

  async initHandDetection() {
    const model = handPoseDetection.SupportedModels.MediaPipeHands;
    const detectorConfig = {
      runtime: "mediapipe", // or 'tfjs',
      solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/hands",
      modelType: "full",
    };
    this.detector = await handPoseDetection.createDetector(
      model,
      detectorConfig
    );

    this.setupCamera();
  }

  async setupCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error(
        "Browser API navigator.mediaDevices.getUserMedia not available"
      );
    }

    this.video = document.getElementById("video");
    if (!this.video) {
      console.error("Video not exist with id : video");
      return;
    }
    const videoConfig = {
      audio: false,
      video: {
        facingMode: "user",
        // Only setting the video to a specified size for large screen, on
        // mobile devices accept the default size.
        width: this.width,
        height: this.height,
        frameRate: {
          ideal: 60,
        },
      },
    };

    const stream = await navigator.mediaDevices.getUserMedia(videoConfig);
    this.video.srcObject = stream;

    await new Promise((resolve) => {
      this.video.onloadedmetadata = () => {
        resolve(this.video);
      };
    });

    this.video.play();

    const videoWidth = this.video.videoWidth;
    const videoHeight = this.video.videoHeight;
    // Must set below two lines, otherwise video element doesn't show.
    this.video.width = videoWidth;
    this.video.height = videoHeight;

    this.canvas = document.createElement("canvas");
    this.canvas.width = videoWidth;
    this.canvas.height = videoHeight;
    this.ctx = this.canvas.getContext("2d");
    document.body.appendChild(this.canvas);

    this.video.style.cssText = `
      transform: scaleX(-1);
      width: auto;
      height: auto;
      position: fixed;
      bottom: 0;
      left: 0;
      z-index: 8;
    `;

    this.canvas.style.cssText = `
      transform: scaleX(-1);
      position: absolute;
      bottom: 0;
      left: 0;
      z-index: 9;
    `;

    this.emit(ON_VIDEO_READY, { video: this.video, canvas: this.canvas });
    this.getHands();
  }

  async renderResult() {
    const { width, height, ctx } = this;
    ctx.clearRect(0, 0, width, height);
    if (this.video.readyState < 2) {
      await new Promise((resolve) => {
        this.video.onloadeddata = () => {
          resolve(video);
        };
      });
    }

    let hands = null;
    const { detector } = this;
    if (detector != null) {
      // Detectors can throw errors, for example when using custom URLs that
      // contain a model that doesn't provide the expected output.
      try {
        hands = await detector.estimateHands(this.video, {
          flipHorizontal: false,
        });
      } catch (error) {
        detector.dispose();
        detector = null;
        alert(error);
      }
    }
    ctx.fillStyle = `rgba(0, 0, 0, ${this.opacity.value})`;
    ctx.fillRect(0, 0, width, height);
    if (hands && hands.length > 0) {
      this.opacity.value = 0.5;
      ctx.fillStyle = "rgb(255, 114, 0)";
      hands.forEach(({ keypoints }) => {
        keypoints.forEach(({ x, y }) => {
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();
        });

        JointPairs.forEach(([a, b]) => {
          const pa = keypoints.find((p) => p.name === a);
          const pb = keypoints.find((p) => p.name === b);

          this.ctx.strokeStyle = "rgba(255, 255, 255, .5)";
          this.ctx.lineWidth = 2;
          this.ctx.beginPath();
          this.ctx.moveTo(pa.x, pa.y);
          this.ctx.lineTo(pb.x, pb.y);
          this.ctx.stroke();
        });
      });

      this.emit("ON_HANDS_DETECTED", hands);
    } else {
      this.opacity.value = 0.2;
      // ctx.fillStyle = `rgba(0, 0, 0, 0.2)`;
      // ctx.fillRect(0, 0, width, height);
      this.emit("ON_HANDS_LOST");
    }
  }

  async getHands() {
    await this.renderResult();

    requestAnimationFrame(() => this.getHands());
  }

  async changeDevice(deviceId) {
    const videoConfig = {
      audio: false,
      video: {
        facingMode: "user",
        // Only setting the video to a specified size for large screen, on
        // mobile devices accept the default size.
        width: this.width,
        height: this.height,
        frameRate: {
          ideal: 60,
        },
        deviceId,
      },
    };

    const stream = await navigator.mediaDevices.getUserMedia(videoConfig);
    this.video.srcObject = stream;

    await new Promise((resolve) => {
      this.video.onloadedmetadata = () => {
        resolve(this.video);
      };
    });

    this.video.play();
  }

  set displayScale(mValue) {
    if (!this.video || !this.canvas) {
      setTimeout(() => {
        this.displayScale = mValue;
      }, 1000 / 60);
      return;
    }
    const { width, height } = this;
    this.video.style.width = `${width * mValue}px`;
    this.video.style.height = `${height * mValue}px`;
    this.canvas.style.width = `${width * mValue}px`;
    this.canvas.style.height = `${height * mValue}px`;
  }

  get deviceId() {
    if (!this.video) return null;
    if (!this.video.srcObject) return null;
    return this.video.srcObject.getVideoTracks()[0].getSettings().deviceId;
  }

  get deviceName() {
    const id = this.deviceId;
    if (id === null) return null;
    return this.deviceNames[this.deviceIds.indexOf(id)];
  }
}
