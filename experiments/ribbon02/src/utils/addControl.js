import * as dat from "dat.gui";
import Config from "../Config";
import Settings from "../Settings";
import { saveJson } from "./";

export default (scene) => {
  const { refresh, reload } = Settings;
  const oControl = {
    save: () => {
      saveJson(Config, "Settings");
    },
  };

  const gui = new dat.GUI({ width: 300 });
  window.gui = gui;

  gui.add(Config, "numParticles", [32, 48, 64, 96, 128]).onChange(reload);
  gui
    .add(Config, "numSets", [10, 12, 14, 16])
    .name("Ribbon length")
    .onFinishChange(reload);

  gui.addColor(Config, "ribbonColor").name("Ribbon Color").onFinishChange(refresh);
  gui.addColor(Config, "skipColor").name("Skip Color").onFinishChange(refresh);
  gui.addColor(Config, "bgColor").name("Background Color").onFinishChange(refresh);
  gui.add(Config, "blurStrength", 0, 2).name("Blur Strength").onFinishChange(refresh);

  // gui.add(Config, "extreme").onChange(refresh);
  // Pose detection removed as per refactoring
  gui.add(Settings, "reset").name("Reset Default Settings");
  gui.add(oControl, "save").name("Save Settings");

  // dat.GUI.toggleHide();
};
