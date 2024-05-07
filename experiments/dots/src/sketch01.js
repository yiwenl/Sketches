import "./hash.js";
import { rgb, getMonoColor } from "./utils/index.js";
import { targetWidth, targetHeight } from "./features.js";
import setupProject from "./utils/setupProject2D.js";

import Settings from "./Settings.js";
import addControls from "./utils/addControl.js";

import { getPalette } from "./utils/SolarPalettes.js";

// development
if (process.env.NODE_ENV === "development") {
  Settings.init();
  addControls();
}
const { ctx, width, height } = setupProject(targetWidth, targetHeight);

ctx.fillStyle = rgb(getMonoColor(255));
ctx.fillRect(0, 0, width, height);

const palette = getPalette(9);
const w = Math.floor(width / palette.length);

palette.forEach((c, i) => {
  ctx.fillStyle = rgb(c);
  ctx.fillRect(i * w, 0, w, height);
});
