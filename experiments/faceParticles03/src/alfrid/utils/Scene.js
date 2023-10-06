import Scheduler from "scheduling";
import { GL } from "../core/GL";
import { CameraPerspective } from "../camera/CameraPerspective";
import { OrbitalControl } from "../utils/OrbitalControl";

class Scene {
  constructor(mGL) {
    this._GL = mGL || GL;

    // setup camera
    this.camera = new CameraPerspective();
    this.camera.setPerspective((45 * Math.PI) / 180, GL.aspectRatio, 0.1, 100);
    this.orbitalControl = new OrbitalControl(this.camera, 15, window);
    this.orbitalControl.radius.value = 10;
    this._isRunning = true;

    this._initTextures();
    this._initViews();

    window.addEventListener("resize", () => this.resize());
    this._efIndex = Scheduler.addEF(() => this._loop());
  }

  stop() {
    this._isRunning = false;
  }

  resume() {
    this._isRunning = true;
  }

  _initTextures() {}

  _initViews() {}

  update() {}

  render() {}

  _loop() {
    if (!this._isRunning) {
      return;
    }
    this.update();

    this._GL.viewport(0, 0, this._GL.width, this._GL.height);
    this._GL.setMatrices(this.camera);
    this.render();
  }

  resize() {
    this._GL.setSize(window.innerWidth, window.innerHeight);
    this.camera.setAspectRatio(this._GL.aspectRatio);
  }
}

export { Scene };
