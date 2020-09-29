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
      .add(Config, "numParticles", [64, 128, 144, 200, 256])
      .onFinishChange(Settings.reload);
    /*
    gui
      .add(Config, "planeSize", 2, 5)
      .step(1)
      .onFinishChange(Settings.reload);

    gui.add(Config, "useColorMap").onFinishChange(Settings.refresh);
    gui
      .add(
        Config,
        "color",
        "001,002,003,004,005,006,007,008,009,test".split(",")
      )
      .onFinishChange(Settings.refresh);
    gui.add(Config, "speed", 0, 2).onFinishChange(Settings.refresh);
    gui.add(Config, "debug").onFinishChange(Settings.refresh);
    gui.add(oControl, "save").name("Save Settings");
    gui.add(Settings, "reset").name("Reset Default");
    */
  }, 200);
};

export default addControls;
