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

  const fSystem = gui.addFolder("System");
  fSystem.add(oControl, "save").name("Save Settings");
  fSystem.add(Settings, "reset").name("Reset Default");

  fSystem.open();
};
