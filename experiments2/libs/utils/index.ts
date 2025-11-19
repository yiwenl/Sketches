import { saveJson } from "./saveJson";
import { addFullscreenToggle } from "./fullscreen";
import { addCapture } from "./capture";
import { resize } from "./resize";
import { mat4 } from "gl-matrix";
export { saveJson, addFullscreenToggle, addCapture, resize };

export const iOS =
  navigator.userAgent.includes("iPhone") ||
  navigator.userAgent.includes("iPad");

export const random = (min?: number, max?: number): number => {
  if (min === undefined) {
    return Math.random();
  }
  if (max === undefined) {
    return Math.random() * min;
  }

  return Math.random() * (max - min) + min;
};

export const randomGaussian = (a?: number, b?: number, l = 5) => {
  let r = 0;
  for (let i = 0; i < l; i++) {
    r += random();
  }
  r /= l;
  if (a === undefined) {
    return r;
  }
  if (b === undefined) {
    return r * a;
  }

  return a + (b - a) * r;
};

export const randomInt = (a?: number, b?: number) => {
  return Math.floor(random(a, b));
};

export const pickWithWeights = (elms: any[], weights: number[]) => {
  let total = 0;
  weights.forEach((w) => {
    total += w;
  });
  let r = random(total);
  let i = 0;
  while (r > 0) {
    r -= weights[i];
    i++;
  }
  return elms[i - 1];
};

export const pick = (elms: any[], weights?: number[]) => {
  if (weights === undefined) {
    return elms[randomInt(elms.length)];
  }
  return pickWithWeights(elms, weights);
};

export const shuffle = (a: any[]) => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const mix = (a: number, b: number, p: number) => {
  return a * (1 - p) + b * p;
};

export const clamp = (v: number, min: number, max: number) => {
  return Math.max(min, Math.min(v, max));
};

export const lerp = (a: number, b: number, p: number) => {
  return a * (1 - p) + b * p;
};

export const smoothstep = (min: number, max: number, value: number) => {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
};

export const smootherstep = (min: number, max: number, value: number) => {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * x * (x * (x * 6 - 15) + 10);
};

export const toGlsl = (v: number) => v / 255;

export const biasMatrix = mat4.fromValues(
  0.5,
  0.0,
  0.0,
  0.0,
  0.0,
  0.5,
  0.0,
  0.0,
  0.0,
  0.0,
  0.5,
  0.0,
  0.5,
  0.5,
  0.5,
  1.0
);
