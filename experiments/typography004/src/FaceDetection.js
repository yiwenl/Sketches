import EventDispatcher from "events";
import * as faceMesh from "@mediapipe/face_mesh";
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";

const scale = 1;
export const videoWidth = 640 * scale;
export const videoHeight = 480 * scale;

export const VIDEO_STARTED = "videoStarted";
export const FACE_DETECTED = "faceDetected";
export const FACE_LOST = "faceLost";

export const STATE = {
  camera: { targetFPS: 60, sizeOption: "640 X 480" },
  backend: "",
  flags: {},
  modelConfig: {},
};
export const MEDIAPIPE_FACE_CONFIG = {
  maxFaces: 1,
  refineLandmarks: true,
  triangulateMesh: true,
  boundingBox: true,
};

class FaceDetection extends EventDispatcher {
  async init() {
    await this._setupCamera();
    this.emit(VIDEO_STARTED);

    const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
    const detectorConfig = {
      runtime: "mediapipe",
      maxFaces: 1,
      solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@${faceMesh.VERSION}`,
      // or 'base/node_modules/@mediapipe/face_mesh' in npm.
    };
    this.detector = await faceLandmarksDetection.createDetector(
      model,
      detectorConfig
    );

    this.checkFace();
  }

  _setupCamera() {
    return new Promise((resolve, reject) => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        reject(new Error("no camera"));
      }

      const video = document.getElementById("video");
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
          console.log("webcams", webcams.length);
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

  async checkFace() {
    if (this.video.readyState < 2) {
      await new Promise((resolve) => {
        console.log("Waiting for video to load");
        this.video.onloadeddata = () => {
          console.log("Video loaded");
          resolve(video);
        };
      });
    }

    const estimationConfig = { flipHorizontal: true };
    const faces = await this.detector.estimateFaces(
      this.video,
      estimationConfig
    );
    if (faces.length > 0) {
      this.emit(FACE_DETECTED, faces[0]);
    } else {
      this.emit(FACE_LOST);
    }

    requestAnimationFrame(() => this.checkFace());
  }
}

export default new FaceDetection();
