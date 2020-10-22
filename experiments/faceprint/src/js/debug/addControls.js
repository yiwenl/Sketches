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

  const checkDebug = () => {
    document.body.classList.remove("debug");
    if (Config.debug) {
      document.body.classList.add("debug");
    }
  };

  const maps = [];
  for (let i = 0; i < 10; i++) {
    maps.push(i);
  }

  setTimeout(() => {
    checkDebug();
    const { gui } = window;

    // gui.add(scene, "offset", 0, 1);
    gui
      .add(Config, "videoSize", [128, 256, 500, 512])
      .onFinishChange(Settings.reload);

    gui.add(Config, "colorMap", maps).onFinishChange(Settings.refresh);
    gui.add(Config, "planeScale", 0, 5).onFinishChange(Settings.refresh);
    gui.add(Config, "edgeWidth", 0, 5).onFinishChange(Settings.refresh);
    gui.add(Config, "shadowStrength", 0, 1).onFinishChange(Settings.refresh);
    gui
      .add(Config, "numPlanes", 5000, 10000)
      .step(1)
      .onFinishChange(Settings.reload);

    gui.add(Config, "debug").onFinishChange(() => {
      checkDebug();
      Settings.refresh();
    });
    gui.add(oControl, "save").name("Save Settings");
    gui.add(Settings, "reset").name("Reset Default");
  }, 200);
};

export default addControls;
