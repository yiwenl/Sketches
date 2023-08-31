import { GL } from "alfrid";

import * as dat from "dat.gui";
import Config from "../Config";
import Settings from "../Settings";
import { saveJson } from "./";

export default (scene) => {
  const { reload } = Settings;
  const oControl = {
    save: () => {
      saveJson(Config, "Settings");
    },
  };

  const gui = new dat.GUI({ width: 300 });
  window.gui = gui;
  gui.add(Settings, "reset").name("Reset Default");
  scene.addDeviceList();

  if (GL.isMobile) {
    dat.GUI.toggleHide();
  }
};
