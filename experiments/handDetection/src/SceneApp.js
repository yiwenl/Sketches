import { GL, DrawBall, DrawAxis, DrawCopy, DrawCamera, Scene } from "alfrid";
import { getMonocolor } from "./utils";

// hand detection
import HandPoseDetection, {
  ON_VIDEO_READY,
  ON_HANDS_LOST,
  ON_HANDS_DETECTED,
} from "./hand-detection";

let hasSaved = false;
let canSave = false;

class SceneApp extends Scene {
  constructor() {
    super();

    this.orbitalControl.lockRotation();
    this.orbitalControl.radius.limit(5, 20);

    // hand detection
    const videoScale = 2;
    const targetWidth = 360 * videoScale;
    const targetHeight = 240 * videoScale;
    this._handDetection = new HandPoseDetection(targetWidth, targetHeight, 1);
    this._handDetection.on(ON_VIDEO_READY, this._onVideoReady);
    this._handDetection.on(ON_HANDS_DETECTED, this._onHandsDetected);
    this._handDetection.on(ON_HANDS_LOST, this._onHandsLost);

    setTimeout(() => {
      canSave = true;
    }, 500);
  }

  _onVideoReady = ({ video }) => {
    this.decivesList = [];
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      console.log("enumerateDevices() not supported.");
    } else {
      // List cameras and microphones.
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          console.table(devices);
          devices.forEach((device) => {
            if (device.kind === "videoinput") {
              this.decivesList.push({
                label: device.label,
                id: device.deviceId,
              });
            }
          });
          const names = this.decivesList.map((d) => d.label);
          const ids = this.decivesList.map((d) => d.id);

          const deviceId = video.srcObject
            .getVideoTracks()[0]
            .getSettings().deviceId;

          this.deviceName = names[ids.indexOf(deviceId)];
          gui
            .add(this, "deviceName", names)
            .name("Camera")
            .onChange(() => {
              const index = names.indexOf(this.deviceName);
              this._handDetection.changeDevice(ids[index]);
            });
        })
        .catch((err) => {
          console.log(`${err.name}: ${err.message}`);
        });
    }
  };

  _initTextures() {
    this.resize();
  }

  _initViews() {
    this._dAxis = new DrawAxis();
    this._dCopy = new DrawCopy();
    this._dBall = new DrawBall();
    this._dCamera = new DrawCamera();
  }

  update() {}

  _onHandsDetected = (hands) => {};

  _onHandsLost = () => {};

  render() {
    let g = 0.1;
    GL.clear(...getMonocolor(g), 1);
    GL.setMatrices(this.camera);
    this._dAxis.draw();
  }

  resize() {
    const pixelRatio = GL.isMobile ? 1 : 1.5;
    const { innerWidth, innerHeight } = window;
    GL.setSize(innerWidth * pixelRatio, innerHeight * pixelRatio);
    this.camera.setAspectRatio(GL.aspectRatio);

    this.orbitalControl.radius.setTo(innerWidth > innerHeight ? 12 : 20);
  }
}

export default SceneApp;
