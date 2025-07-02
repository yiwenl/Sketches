import "./hash.js";
import { rgb, getMonoColor, randomGaussian, mix } from "./utils/index.js";
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

let num = 100000;
let counts = [];
const numSlots = 20;

while (num--) {
  let v = Math.floor(randomGaussian(0, numSlots, 5));
  if (!counts[v]) {
    counts[v] = 0;
  }
  counts[v]++;
}

// const max = Math.max(...counts);
let max = 0;
counts.forEach((c) => {
  if (c > max) {
    max = c;
  }
});

const w = width / counts.length;
counts.forEach((c, i) => {
  const p = c / max;
  let h = p * height;
  console.log(p, h, max, c);
  ctx.fillStyle = rgb(getMonoColor(255 * mix(0.5, 1, p)));
  ctx.fillRect(i * w, height - h, w, h);
});
