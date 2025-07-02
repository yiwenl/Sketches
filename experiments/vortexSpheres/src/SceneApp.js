import { GL, DrawBall, DrawAxis, DrawCopy, Scene } from "alfrid";
import { targetWidth, targetHeight } from "./features";
import resize from "./utils/resize";
import { RAD, toGlsl, saveImage, getDateString } from "./utils";
import Config from "./Config";
import { FilamentSystem } from "./Filament";

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

    // this.orbitalControl.radius.setTo(1);
    // this.camera.setPerspective(60 * RAD, GL.aspectRatio, 0.01, 10);

    // this.orbitalControl.lock();

    setTimeout(() => {
      canSave = true;
    }, 500);
  }

  _init() {
    this.resize();
    const verticesPerFilament = 24;
    const variation = 0.005 * 10;
    const smoothingRadius = 0.4;
    this._filamentSystem = new FilamentSystem(
      verticesPerFilament,
      variation,
      smoothingRadius
    );
    console.table(this._filamentSystem.filaments);
  }

  _initTextures() {}

  _initViews() {
    this._dAxis = new DrawAxis();
    this._dCopy = new DrawCopy();
    this._dBall = new DrawBall();
  }

  update() {
    this._filamentSystem.simulate();
  }

  render() {
    let g = 0.1;
    GL.clear(...Config.colorBg.map(toGlsl), 1);
    GL.setMatrices(this.camera);

    this._dAxis.draw();

    g = 0.05;
    const s = [g, g, g];
    const { filaments } = this._filamentSystem;
    filaments.forEach((filament) => {
      const { dummy, vertices } = filament;
      const color = dummy ? [1, 0, 0] : [0, 1, 0];
      vertices.forEach((p) => {
        this._dBall.draw(p, s, color);
      });
    });

    if (canSave && !hasSaved && Config.autoSave) {
      saveImage(GL.canvas, getDateString());
      hasSaved = true;
    }
  }

  resize() {
    if (!Config.useTargetSize) {
      const { innerWidth, innerHeight } = window;
      const pixelRatio = 1.5;
      GL.setSize(innerWidth * pixelRatio, innerHeight * pixelRatio);
      this.camera?.setAspectRatio(GL.aspectRatio);
    }
  }
}

export default SceneApp;
