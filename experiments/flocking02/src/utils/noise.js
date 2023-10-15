import SimplexNoise from "simplex-noise";

let simplex = new SimplexNoise(fxhash);

export const noise = (a, b, c, d) => {
  if (c === undefined) {
    return simplex.noise2D(a, b);
  } else if (d === undefined) {
    return simplex.noise3D(a, b, c);
  } else {
    return simplex.noise4D(a, b, c, d);
  }
};

export const noise2D = (a, b, s = 1) => {
  return noise(a * s, b * s);
};

export const noise3D = (a, b, c, s = 1) => {
  return noise(a * s, b * s, c * s);
};

export const fbm2D = (a, b, scale = 1, level = 5) => {
  let n = 0;
  let t = 0;
  for (let i = 0; i < level; i++) {
    t = Math.pow(2, i);
    n += noise2D(a * scale * t, b * scale * t) / t;
  }

  return n;
};

export const fbm3D = (a, b, c, s = 1, l = 5, p = 2) => {
  let n = 0;
  let t = 0;
  for (let i = 0; i < l; i++) {
    t = Math.pow(p, i);
    n += noise3D(a, b, c, s * t) / t;
  }

  return n;
};
