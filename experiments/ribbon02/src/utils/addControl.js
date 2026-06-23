import * as dat from "dat.gui";
import Config from "../Config";
import Settings from "../Settings";
import { saveJson } from "./";

export default (scene) => {
  const { refresh, reload } = Settings;
  const isDevelopment = process.env.NODE_ENV === "development";
  const oControl = {
    save: () => {
      saveJson(Config, "Settings");
    },
  };

  const gui = new dat.GUI({ width: 300 });
  window.gui = gui;

  gui
    .add(Config, "numParticles", [32, 48, 56, 64, 96])
    .name("Particles Per Side")
    .onChange(reload);
  gui
    .add(Config, "numSets", [10, 12, 14, 16])
    .name("Ribbon length")
    .onFinishChange(reload);
  gui.add(Config, "useHandDetection").name("Use Hand Detection").onFinishChange(reload);

  if (isDevelopment) {
    gui.addColor(Config, "ribbonColor").name("Ribbon Color").onFinishChange(refresh);
    gui.addColor(Config, "bgColor").name("Background Color").onFinishChange(refresh);
    gui
      .add(Config, "lookupStrength", 0, 1)
      .name("Lookup Strength")
      .onFinishChange(refresh);
    gui
      .add(Config, "vignetteStrength", 0, 1.2)
      .name("Vignette Strength")
      .onFinishChange(refresh);
    gui
      .add(Config, "cornerDarkStrength", 0, 1)
      .name("Corner Darken")
      .onFinishChange(refresh);
    gui
      .add(Config, "lightFalloff", 0, 0.3)
      .name("Light Falloff")
      .onFinishChange(refresh);
    gui
      .add(Config, "lightFalloffStart", 0, 15)
      .name("Falloff Start")
      .onFinishChange(refresh);
    gui
      .add(Config, "fluidNoiseAmount", 0, 4)
      .name("Fluid Noise Amount")
      .onFinishChange(refresh);
    gui
      .add(Config, "fluidFlowMapStrength", 0, 10)
      .name("Fluid Flow Strength")
      .onFinishChange(refresh);

    // gui.add(Config, "extreme").onChange(refresh);
    gui.add(Settings, "reset").name("Reset Default Settings");
    gui.add(oControl, "save").name("Save Settings");
  }

  // dat.GUI.toggleHide();
};
