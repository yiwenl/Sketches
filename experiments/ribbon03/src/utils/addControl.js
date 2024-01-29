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

  if (!GL.isMobile) {
    gui.add(Config, "useHandDetection").onFinishChange(reload);
    gui.add(Config, "numParticles", [64, 96, 128, 144]).onChange(reload);
    gui
      .add(Config, "numSets", [4, 6, 8, 10])
      .name("Ribbon length")
      .onFinishChange(reload);
  }

  gui.add(Config, "colorIndex", [0, 1, 2, 3, 4, 5]).onFinishChange(() => {
    refresh();
    scene.updateColor();
  });

  if (!GL.isMobile) {
    gui.add(Config, "usePostEffect").onFinishChange(refresh);
    gui.add(Settings, "reset").name("Reset Default");
  }

  // dat.GUI.toggleHide();
};
