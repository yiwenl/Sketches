import { GL } from "alfrid";

import * as dat from "dat.gui";
import Config from "../Config";
import Settings from "../Settings";
import { rgb } from "../utils";
import { saveJson } from "./";

const showColorControls = false;

export default (scene) => {
  const { refresh, reload } = Settings;
  const oControl = {
    save: () => {
      saveJson(Config, "Settings");
    },
  };

  const gui = new dat.GUI({ width: 300 });
  window.gui = gui;

  gui.add(Config, "numParticles", [128, 256, 384, 512]).onChange(reload);

  if (showColorControls) {
    gui.addColor(Config, "colorShadow").onChange(refresh);
    gui.addColor(Config, "colorDiffuse").onChange(refresh);
    gui.addColor(Config, "colorAO").onChange(refresh);
    gui.addColor(Config, "colorReflection0").onChange(refresh);
    gui.addColor(Config, "colorReflection1").onChange(refresh);
    gui.add(Config, "showReflection").onChange(refresh);
  }

  // dat.GUI.toggleHide();
};
