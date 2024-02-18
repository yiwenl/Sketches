import { GL } from "alfrid";

import * as dat from "dat.gui";
import Config from "../Config";
import Settings from "../Settings";
import { saveJson } from "./";
import Color from "../utils/Color";
import ColorThemes from "../ColorThemes";

const showRGBControl = 1;
const showColorControl = true;

export default (scene) => {
  const { refresh, reload } = Settings;
  const oControl = {
    save: () => {
      saveJson(Config, "Settings");
    },
  };

  // color
  const oColorBg = new Color(Config.colorBg);
  const oColorShadow = new Color(Config.colorShadow);
  const oColorPetal = new Color(Config.colorPetal);

  const updateColor = () => {
    const theme = ColorThemes[Config.colorTheme];
    console.log(theme);
    for (const key in theme) {
      Config[key] = theme[key];
    }

    oColorBg.value = Config.colorBg;
    oColorShadow.value = Config.colorShadow;
    oColorPetal.value = Config.colorPetal;
    refresh();
  };

  const themeOptions = [];
  for (let key in ColorThemes) {
    themeOptions.push(key);
  }

  const gui = new dat.GUI({ width: 300 });
  window.gui = gui;
  gui.add(Config, "colorTheme", themeOptions).onFinishChange(updateColor);
  gui
    .add(Config, "numParticles", [128, 144, 192, 256, 384, 512])
    .onFinishChange(reload);
  // gui.add(Config, "usePoseDetection").onFinishChange(reload);
  // gui.add(Config, "usePostEffect").onFinishChange(refresh);
  // gui.add(Config, "emitRandomBurst").onFinishChange(reload);
  // gui.add(Config, "useSocket").onFinishChange(reload);

  let fColor;
  if (showColorControl) {
    fColor = gui.addFolder("Color");
    fColor.open();
  }

  const addColorControl = (mName, oColor, mOpen = true) => {
    const f = fColor.addFolder(mName);
    f.addColor(oColor, "value").name(mName).onFinishChange(_refresh).listen();
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

  const _refresh = () => {
    Config.colorBg = oColorBg.value;
    Config.colorShadow = oColorShadow.value;
    Config.colorPetal = oColorPetal.value;
    refresh();
  };

  if (showColorControl) {
    addColorControl("colorBg", oColorBg);
    addColorControl("colorShadow", oColorShadow);
    addColorControl("colorPetal", oColorPetal);
  }

  // system
  gui.add(oControl, "save").name("Save settings");
  // gui.add(Settings, "reset").name("Reset default settings");

  // dat.GUI.toggleHide();
};
