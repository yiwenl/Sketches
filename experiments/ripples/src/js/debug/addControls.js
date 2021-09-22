// addControls.js

import Settings from "../Settings";
import Config from "../Config";
import { saveJson } from "../utils";
import { GL } from "alfrid";

const addControls = () => {
  const oControl = {
    save: () => {
      saveJson(Config, "Settings");
    },
    webgl2: GL.webgl2.toString(),
  };

  setTimeout(() => {
    gui.add(oControl, "webgl2").listen();
    gui
      .add(Config, "numParticles", [128, 256, 512, 1024])
      .onFinishChange(Settings.reload);

    gui.addColor(Config, "bgColor").onFinishChange(Settings.refresh);
    gui.addColor(Config, "shadowColor").onFinishChange(Settings.refresh);
    gui
      .add(Config, "colorIndex", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
      .onFinishChange(Settings.refresh)
      .listen();

    gui.add(Config, "noiseStrength", 0, 1).onFinishChange(Settings.refresh);
    gui.add(Config, "particleScale", 0, 1).onFinishChange(Settings.refresh);
    gui.add(Config, "cameraMovement").onFinishChange(Settings.refresh);
    gui.add(Config, "debug").onFinishChange(Settings.refresh);
    gui.add(oControl, "save").name("Save Settings");
    gui.add(Settings, "reset").name("Reset Default");
  }, 200);
};

export default addControls;
