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
    // gui.add(Config, 'numParticles', 32, 512).step(1).onFinishChange(Settings.reload)
    // gui.add(Config, 'numSets', 1, 8).step(1).onFinishChange(Settings.reload)
    // gui.add(Config, 'useTextureOffset').onFinishChange(Settings.refresh)
    // gui.add(Config, 'pause').onFinishChange(Settings.refresh)
    // gui.add(oControl, "save").name("Save Settings");
    // gui.add(Settings, "reset").name("Reset Default");
  }, 200);
};

export default addControls;
