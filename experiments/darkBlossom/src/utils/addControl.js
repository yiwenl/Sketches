import { GL } from "alfrid";

import * as dat from "dat.gui";
import Config from "../Config";
import Settings from "../Settings";
import { rgb } from "../utils";
import { saveJson } from "./";
import { resizeUpdate } from "./resize";
import addPreview, { resizeThumbnail } from "./thumbnail";

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
  const updateBackgroundColor = () => {
    refresh();
    document.body.style.backgroundColor = rgb(Config.background);
  };

  const updateThumbnail = () => {
    refresh();
    resizeThumbnail();
  };

  fSystem
    .add(Config, "margin", 0, 500)
    .step(1)
    .onChange(function () {
      refresh();
      resizeUpdate();
    });

  fSystem.addColor(Config, "background").onChange(updateBackgroundColor);
  fSystem.add(Config, "showThumbnail").onFinishChange(reload);
  if (Config.showThumbnail) {
    fSystem
      .add(Config, "thumbnailSize", 0, 500)
      .step(1)
      .onFinishChange(updateThumbnail);
  }
  fSystem.add(Config, "autoSave").onFinishChange(reload);

  fSystem.add(oControl, "save").name("Save Settings");
  fSystem.add(Settings, "reset").name("Reset Default");

  fSystem.open();

  resizeUpdate();
  updateBackgroundColor();

  if (Config.showThumbnail) {
    addPreview(GL.canvas);
  }
};
