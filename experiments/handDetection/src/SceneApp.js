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
    const { deviceNames, deviceIds, deviceName } = this._handDetection;

    this.deviceName = deviceName;

    gui
      .add(this, "deviceName", deviceNames)
      .name("Camera")
      .onChange(() => {
        const index = deviceNames.indexOf(this.deviceName);
        this._handDetection.changeDevice(deviceIds[index]);
      });
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
