// addControls.js

import Settings from "../Settings";
import Config from "../Config";
import { saveJson } from "../utils";

const addControls = (scene) => {
  const oControl = {
    save: () => {
      saveJson(Config, "Settings");
    },
  };

  setTimeout(() => {
    gui
      .add(Config, "numParticles", [32, 64, 128, 256])
      .onFinishChange(Settings.reload);

    gui.add(Config, "numSets", [1, 2, 3, 4, 5]).onFinishChange(Settings.reload);
    gui.add(Config, "noiseScale", 0.01, 1).onFinishChange(Settings.refresh);
    gui.add(Config, "helperLines").onFinishChange(Settings.refresh);
    gui.add(oControl, "save").name("Save Settings");
    gui.add(Settings, "reset").name("Reset Default");
  }, 200);
};

export default addControls;
