import { GL, DrawBall, DrawAxis, DrawCopy, Scene } from "alfrid";
import { targetWidth, targetHeight } from "./features";
import resize from "./utils/resize";
import { mix, map, toGlsl, saveImage, getDateString } from "./utils";
import Config from "./Config";

// pose detection
import PoseDetection, { POSE_FOUND, POSE_LOST } from "./PoseDetection";
import TrackPoint2D from "./TrackPoint2D";

// fluid simulation
import FluidSimulation from "./fluid-sim";

import Background from "./Background";

let hasSaved = false;
let canSave = false;

class SceneApp extends Scene {
  constructor() {
    super();

    if (Config.useTargetSize) {
      GL.setSize(targetWidth, targetHeight);
      this.camera.setAspectRatio(GL.aspectRatio);
      resize(GL.canvas, targetWidth, targetHeight);
    }

    // this.orbitalControl.lock();

    setTimeout(() => {
      canSave = true;
    }, 500);
  }

  _init() {
    this.resize();

    this._poseDetection = new PoseDetection("dance3.mp4");
    this._poseDetection.on(POSE_FOUND, (o) => this._onPoseFound(o));
    this._poseDetection.on(POSE_LOST, () => this._onPoseLost());
    const { width, height } = this._poseDetection;
    this._videoRatio = width / height;
    this._trackPoints = [];

    // fluid
    const DISSIPATION = 0.98;
    this._fluid = new FluidSimulation({
      DENSITY_DISSIPATION: DISSIPATION,
      VELOCITY_DISSIPATION: DISSIPATION,
      PRESSURE_DISSIPATION: DISSIPATION,
    });
  }

  _onPoseFound(o) {
    const { minSpeed, maxSpeed } = Config;
    if (this._trackPoints.length === 0) {
      this._trackPoints = o.map(({ pos }) => {
        return new TrackPoint2D(pos);
      });
    } else {
      this._trackPoints.forEach((t, i) => {
        const { pos, score } = o[i];
        if (score > 0.5) {
          t.update(pos);
        } else {
          t.reset(pos);
        }
      });

      const adjPos = (p) => {
        const u = (0.5 - p[0]) / this._videoRatio + 0.5;
        return [u, p[1]];
      };

      const adjDir = (d) => {
        return [-d[0], d[1]];
      };

      // update fluid
      this._trackPoints.forEach((t) => {
        const { pos, dir, speed } = t;
        if (speed > 0) {
          let p = map(speed, minSpeed, maxSpeed, 0, 1);
          p = Math.pow(p, 4);
          const force = mix(1, 20, p);
          const radius = mix(1, 5, p);
          this._fluid.updateFlow(adjPos(pos), adjDir(dir), force, radius, 0.5);
        }
      });
    }
  }

  _onPoseLost() {}

  _initTextures() {}

  _initViews() {
    const { width: vw, height: vh } = this._poseDetection;
    console.log(vw, vh);
    this._dAxis = new DrawAxis();
    this._dCopy = new DrawCopy();
    this._dBall = new DrawBall();
    this._background = new Background(vw, vh);
  }

  update() {
    this._fluid.update();
    this._background.update(this._fluid.velocity, this._fluid.density);
  }

  render() {
    let g = 0.1;
    GL.clear(...Config.colorBg.map(toGlsl), 1);
    GL.setMatrices(this.camera);

    this._dAxis.draw();

    g = GL.width / 2;
    GL.viewport(0, 0, g, g / this._videoRatio);
    this._dCopy.draw(this._background.texture);
    // GL.viewport(g, 0, g, g / this._videoRatio);
    // this._dCopy.draw(this._fluid.velocity);
    // GL.viewport(g * 2, 0, g, g / this._videoRatio);
    // this._dCopy.draw(this._fluid.density);

    if (canSave && !hasSaved && Config.autoSave) {
      saveImage(GL.canvas, getDateString());
      hasSaved = true;
    }
  }

  resize() {
    if (!GL.useTargetSize) {
      const { innerWidth, innerHeight } = window;
      const pixelRatio = 1.5;
      GL.setSize(innerWidth * pixelRatio, innerHeight * pixelRatio);
      this.camera?.setAspectRatio(GL.aspectRatio);
    }
  }
}

export default SceneApp;
