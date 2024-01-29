import Emitter from "events";
import * as handPoseDetection from "@tensorflow-models/hand-pose-detection";

export const ON_HANDS_DETECTED = "ON_HANDS_DETECTED";
export const ON_HANDS_LOST = "ON_HANDS_LOST";

export default class HandPoseDetection extends Emitter {
  constructor(mWidth = 360, mHeight = 270) {
    super();
    this.width = mWidth;
    this.height = mHeight;
    this.initHandDetection();
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
          ideal: 30,
        },
      },
    };

    const stream = await navigator.mediaDevices.getUserMedia(videoConfig);
    this.video.srcObject = stream;

    await new Promise((resolve) => {
      this.video.onloadedmetadata = () => {
        resolve(video);
      };
    });

    this.video.play();

    const videoWidth = this.video.videoWidth;
    const videoHeight = this.video.videoHeight;
    // Must set below two lines, otherwise video element doesn't show.
    this.video.width = videoWidth;
    this.video.height = videoHeight;
    this.video.style.width = `${videoWidth / 2}px`;
    this.video.style.height = `${videoHeight / 2}px`;

    this.getHands();
  }

  async renderResult() {
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
    if (hands && hands.length > 0) {
      this.emit("ON_HANDS_DETECTED", hands);
    } else {
      this.emit("ON_HANDS_LOST");
    }
  }

  async getHands() {
    await this.renderResult();

    requestAnimationFrame(() => this.getHands());
  }
}
