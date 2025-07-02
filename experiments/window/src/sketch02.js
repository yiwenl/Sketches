import "./hash.js";
import {
  rgb,
  random,
  getMonoColor,
  randomGaussian,
  mix,
  pickWithWeights,
} from "./utils/index.js";
import { targetWidth, targetHeight } from "./features.js";
import setupProject from "./utils/setupProject2D.js";

import Settings from "./Settings.js";
import addControls from "./utils/addControl.js";

import { getPalette } from "./utils/SolarPalettes.js";

// development
if (process.env.NODE_ENV === "development") {
  Settings.init();
  // addControls();
}
const { ctx, width, height } = setupProject(targetWidth, targetHeight);

let num = 100000;
let counts = [];
const numSlots = 20;

const values = [];
const weights = [];

for (let i = 0; i < numSlots; i++) {
  counts[i] = 0;
  values[i] = i;
  weights[i] = random(1, 2);
}

while (num--) {
  let v = pickWithWeights(values, weights);
  counts[v]++;
}

console.table(counts);

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
  ctx.fillStyle = rgb(getMonoColor(255 * mix(0.2, 1, p)));
  ctx.fillRect(i * w, height - h, w, h);
});
