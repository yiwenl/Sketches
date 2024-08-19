import { GL } from "alfrid";

import * as dat from "dat.gui";
import Config from "../Config";
import Settings from "../Settings";
import { rgb } from "../utils";
import { saveJson } from "./";
import { availableRatio } from "../features";
import Color from "../utils/Color";

const showColorControls = true;
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

  gui.add(Config, "numParticles", [128, 256, 384, 512]).onChange(reload);
  // gui.add(Config, "mirrored").onChange(reload);

  gui.add(Config, "useTargetRatio").onChange(reload);
  gui.add(Config, "ratio", availableRatio).onChange(reload);
  gui.add(Config, "pixelRatio", [1, 1.5, 2]).onChange(reload);
  gui.add(Config, "lutStrength", 0, 1).onChange(refresh);

  gui.add(Config, "colorSeparation", 0, 1).onChange(refresh);
  gui.add(Config, "randomMovements").onChange(refresh);
  gui.add(Config, "usePoseDetection").onChange(reload);

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

  const fColor = gui.addFolder("Color");

  if (showColorControls) {
    addColorControl(fColor, "colorHighlight");
    addColorControl(fColor, "colorShadow");
    addColorControl(fColor, "colorDiffuse");
    addColorControl(fColor, "colorAO");
    // fColor.addColor(Config, "colorHighlight").onChange(refresh);
    // fColor.addColor(Config, "colorShadow").onChange(refresh);
    // fColor.addColor(Config, "colorDiffuse").onChange(refresh);
    // fColor.addColor(Config, "colorAO").onChange(refresh);
    fColor.addColor(Config, "colorReflection0").onChange(refresh);
    fColor.addColor(Config, "colorReflection1").onChange(refresh);
    gui.add(Config, "showReflection").onChange(refresh);
    gui.add(oControl, "save").name("Save Settings");
    gui.add(Settings, "reset").name("Reset Default Settings");
  }

  fColor.open();

  // dat.GUI.toggleHide();
};
