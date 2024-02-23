import { GL } from "alfrid";

import * as dat from "dat.gui";
import Config from "../Config";
import Settings from "../Settings";
import { rgb } from "../utils";
import { saveJson } from "./";
import { resizeUpdate } from "./resize";
import addPreview, { resizeThumbnail } from "./thumbnail";
import Color from "../utils/Color";

const showRGBControl = false;

export default (scene) => {
  const { refresh, reload } = Settings;
  const oControl = {
    save: () => {
      saveJson(Config, "Settings");
    },
  };

  const gui = new dat.GUI({ width: 300 });
  window.gui = gui;

  gui.add(Config, "numParticles", [256, 512, 768, 1024]).onFinishChange(reload);
  gui.add(Config, "particleScale", 0.1, 4).onFinishChange(refresh);

  // color
  const addColorControl = (mFolder, mAttr, mName, mOpen = true) => {
    const oColor = new Color(Config[mAttr]);
    mName = mName || mAttr;

    const _refresh = () => {
      Config[mAttr] = oColor.value;
      refresh();
    };

    const f = mFolder.addFolder(mName);
    f.addColor(oColor, "value").onFinishChange(_refresh).listen();
    f.add(oColor, "hue", 0, 360).onFinishChange(_refresh).listen();
    f.add(oColor, "saturation", 0, 1).onFinishChange(_refresh).listen();
    f.add(oColor, "lightness", 0, 1).onFinishChange(_refresh).listen();
    if (showRGBControl) {
      f.add(oColor, "r", 0, 255).step(1).onFinishChange(_refresh).listen();
      f.add(oColor, "g", 0, 255).step(1).onFinishChange(_refresh).listen();
      f.add(oColor, "b", 0, 255).step(1).onFinishChange(_refresh).listen();
    }
    mOpen && f.open();
  };

  addColorControl(gui, "colorBg");

  // system settings
  const fSystem = gui.addFolder("System");
  const updateBackgroundColor = () => {
    refresh();
    document.body.style.backgroundColor = rgb(Config.background);
  };

  const updateThumbnail = () => {
    refresh();
    resizeThumbnail();
  };

  fSystem.add(Config, "useTargetSize").onFinishChange(reload);

  if (Config.useTargetSize) {
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
