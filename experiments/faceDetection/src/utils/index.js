export { saveImage } from "./saveImage";
export { saveJson } from "./saveJson";
export { getDateString } from "./getDateString";

export const logError = (e) => {
  console.error(e);
};

export const random = (a, b) => {
  if (a === undefined) {
    return fxrand();
  }
  if (b === undefined) {
    return fxrand() * a;
  }
  return a + (b - a) * fxrand();
};

export const randomInt = (a, b) => {
  return Math.floor(random(a, b));
};

export const rgb = (r, g, b) => {
  if (r.length) {
    return rgb(r[0], r[1], r[2]);
  }
  if (g === undefined) {
    return `rgb(${r}, ${r}, ${r})`;
  } else {
    return `rgb(${r}, ${g}, ${b})`;
  }
};

export const pick = (elms) => {
  return elms[randomInt(elms.length)];
};

export const rgba = (r, g, b, a = 1) => {
  let _g, _b;
  if (g === undefined) {
    _g = r;
  }

  if (b === undefined) {
    _b = r;
  }

  return `rgb(${r}, ${g}, ${b}, ${a})`;
};

export const brightness = (color) => {
  return Math.sqrt(
    color[0] * color[0] + color[1] * color[1] + color[2] * color[2]
  );
};

export const shuffle = (a) => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const mix = (a, b, p) => {
  return a * (1 - p) + b * p;
};

export const mixColor = (a, b, p) => {
  return [mix(a[0], b[0], p), mix(a[1], b[1], p), mix(a[2], b[2], p)];
};

export const smoothstep = (min, max, value) => {
  var x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
};
