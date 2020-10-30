import "../scss/global.scss";

import SceneApp from "./SceneApp";
import Settings from "./Settings";
import preload from "./utils/preload";
import addControls from "./debug/addControls";

const webgl2Check = () => {
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl2");
  return !!gl;
};

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
  console.log("IS_DEVELOPMENT", process.env.NODE_ENV === "development");

  // if (process.env.NODE_ENV === "development") {
  //   Settings.init();
  // }

  // CREATE SCENE
  const scene = new SceneApp();

  if (process.env.NODE_ENV === "development") {
    addControls(scene);
  }
}
