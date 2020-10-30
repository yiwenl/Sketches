import "../scss/global.scss";

import SceneApp from "./SceneApp";
import Settings from "./Settings";
import preload from "./utils/preload";
import addControls from "./debug/addControls";
import Config from "./Config";
import webgl2Check from "./utils/webgl2Check";
import { getRandomElement } from "randomutils";

if (document.body) {
  _init();
} else {
  window.addEventListener("DOMContentLoaded", _init);
}

function _init() {
  const hasWebgl2 = webgl2Check();
  if (!hasWebgl2) {
    document.body.classList.add("no-webgl2");
    return;
  }

  const useWebgl2 = true;
  preload({ useWebgl2 }).then(init3D, logError);
}

function logError(e) {
  console.log("Error", e);
}

function init3D() {
  console.log("process.env", process.env);
  console.log("process.env.NODE_ENV", process.env.NODE_ENV);
  console.log("IS_DEVELOPMENT", process.env.NODE_ENV === "development");

  if (process.env.NODE_ENV === "development") {
    // Settings.init();
  }

  const colorMaps = "001,002,003,004,005,006,007,008,009,test".split(",");
  Config.color = getRandomElement(colorMaps);

  // CREATE SCENE
  const scene = new SceneApp();

  if (process.env.NODE_ENV === "development") {
    // addControls(scene);
  }
}
