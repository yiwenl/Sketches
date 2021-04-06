// debug.js
import dat from "dat.gui";
import Stats from "stats.js";
import Scheduler from "scheduling";

import { GL } from "alfrid";

// INIT DAT-GUI
window.gui = new dat.GUI({ width: 300 });
const div = document.body.querySelector(".dg.ac");
div.style.zIndex = "999";

if (GL.isMobile) {
  dat.GUI.toggleHide();
}

// STATS
const stats = new Stats();
document.body.appendChild(stats.domElement);
Scheduler.addEF(() => stats.update());
