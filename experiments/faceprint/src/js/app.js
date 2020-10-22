import "../scss/global.scss";

import SceneApp from "./SceneApp";
import Settings from "./Settings";
import preload from "./utils/preload";
import addControls from "./debug/addControls";
import Config from "./Config";

if (document.body) {
  _init();
} else {
  window.addEventListener("DOMContentLoaded", _init);
}

function _init() {
  preload().then(init3D, logError);
}

function logError(e) {
  console.log("Error", e);
}

function init3D() {
  console.log("process.env", process.env);
  console.log("process.env.NODE_ENV", process.env.NODE_ENV);
  console.log("IS_DEVELOPMENT", process.env.NODE_ENV === "development");

  if (process.env.NODE_ENV === "development") {
    Settings.init();
  }

  Config.colorMap = 0;
  Settings.refresh();

  // CREATE SCENE
  const scene = new SceneApp();

  if (process.env.NODE_ENV === "development") {
    addControls(scene);
  }
}
