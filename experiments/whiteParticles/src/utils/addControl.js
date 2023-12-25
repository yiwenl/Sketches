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

  gui.add(Config, "numParticles", [128, 256, 384, 512]).onChange(reload);

  gui.addColor(Config, "colorShadow").onChange(refresh);
  gui.addColor(Config, "colorDiffuse").onChange(refresh);
  gui.addColor(Config, "colorAO").onChange(refresh);
  gui.addColor(Config, "colorReflection0").onChange(refresh);
  gui.addColor(Config, "colorReflection1").onChange(refresh);
  gui.add(Config, "showReflection").onChange(refresh);

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

  // dat.GUI.toggleHide();
};
