// debug.js
import dat from "dat.gui";
import Stats from "stats.js";
import alfrid from "alfrid";

const webgl2Check = () => {
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl2");
  return !!gl;
};

if (webgl2Check()) {
  // INIT DAT-GUI
  window.gui = new dat.GUI({ width: 300 });
  const div = document.body.querySelector(".dg.ac");
  div.style.zIndex = "999";

  // STATS
  const stats = new Stats();
  document.body.appendChild(stats.domElement);
  alfrid.Scheduler.addEF(() => stats.update());
}
