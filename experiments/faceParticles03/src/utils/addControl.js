import { GL } from "alfrid";

import * as dat from "dat.gui";
import Config from "../Config";
import Settings from "../Settings";
import { rgb } from "../utils";
import { saveJson } from "./";
import { resizeUpdate } from "./resize";

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
    .add(Config, "numParticles", [128, 144, 192, 256, 384, 512, 768, 1024])
    .onFinishChange(reload);

  gui.add(Config, "postEffect").onFinishChange(refresh);

  // gui.add(Config, "particleScale", 0.2, 5).onFinishChange(refresh);
  // gui.add(Config, "showWebcam").onFinishChange(refresh);

  // gui.addColor(Config, "colorBg").onFinishChange(() => {
  //   scene.updateBg();
  //   refresh();
  // });
  // gui.addColor(Config, "colorHighlight").onFinishChange(refresh);
  // gui.addColor(Config, "colorShadow").onFinishChange(refresh);
  // gui.add(Config, "audio").onFinishChange(reload);

  // const fSystem = gui.addFolder("System");
  // fSystem.add(Config, "autoSave").onFinishChange(reload);
  // fSystem.add(oControl, "save").name("Save Settings");
  // fSystem.add(Settings, "reset").name("Reset Default");

  // fSystem.open();

  // dat.GUI.toggleHide();
};
