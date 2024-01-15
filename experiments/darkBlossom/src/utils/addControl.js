import { GL } from "alfrid";

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
  gui
    .add(Config, "numParticles", [128, 144, 192, 256, 384, 512])
    .onFinishChange(reload);
  gui.add(Config, "usePoseDetection").onFinishChange(reload);
  // gui.add(Config, "floorLevel", 0, -2).onFinishChange(reload);
  // gui.addColor(Config, "colorBg").onChange(refresh);
  // gui.addColor(Config, "colorCover").onChange(refresh);
  // gui.addColor(Config, "colorShadow").onChange(refresh);
  // gui.addColor(Config, "colorPetal").onChange(refresh);

  gui.add(Settings, "reset").name("Reset default settings");

  // dat.GUI.toggleHide();
};
