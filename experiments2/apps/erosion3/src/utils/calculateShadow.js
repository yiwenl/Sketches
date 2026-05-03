import { readPixels } from "./readPixels";
import { vec3, vec4 } from "gl-matrix";

const mix = (a, b, t) => a * (1 - t) + b * t;
const clamp = (x, min, max) => Math.max(min, Math.min(x, max));

const smoothstep = (a, b, x) => {
  let t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

export default function calculateShadow(
  mLines,
  mLight,
  mMatrixShadow,
  mShadowMap,
  mDepthMap,
  mCameraMatrix
) {
  const shadowDepths = readPixels(mShadowMap, true);
  let depthData = readPixels(mDepthMap, true);
  const { max, floor, pow } = Math;
  const dirLight = vec3.normalize([0, 0, 0], mLight);
  let shadowStrength = 0.4;

  const isInShadow = (mPoint) => {
    let shadowCoord = vec4.fromValues(mPoint[0], mPoint[1], mPoint[2], 1.0);

    // shadow space position
    vec4.transformMat4(shadowCoord, shadowCoord, mMatrixShadow);
    vec4.scale(shadowCoord, shadowCoord, 1 / shadowCoord[3]);
    let u = shadowCoord[0];
    let v = shadowCoord[1];
    let iu = floor(u * mShadowMap.width);
    let iv = floor(v * mShadowMap.height);
    let index = iu + iv * mShadowMap.width;
    let z = shadowCoord[2];
    let depth = shadowDepths[index * 4];
    let bias = 0.005;
    return z > depth + bias;
  };

  let coord = vec4.create();
  const isBehindObject = (mPoint) => {
    vec4.set(coord, mPoint[0], mPoint[1], mPoint[2], 1.0);
    vec4.transformMat4(coord, coord, mCameraMatrix);
    vec4.scale(coord, coord, 1 / coord[3]);

    if (coord[0] <= -1 || coord[0] >= 1 || coord[1] <= -1 || coord[1] >= 1) {
      return true;
      // return [1, 0.5, 0];
    }

    let u = coord[0] * 0.5 + 0.5;
    let v = coord[1] * 0.5 + 0.5;
    let d = coord[2] * 0.5 + 0.5;
    let iu = floor(u * mDepthMap.width);
    let iv = floor(v * mDepthMap.height);
    let index = iu + iv * mDepthMap.width;
    let depth = depthData[index * 4];

    // return [u, v, depth];
    const bias = 0.005;
    return d > depth + bias;
  };

  mLines.forEach((line) => {
    line.forEach((lineData) => {
      const { point, normal } = lineData;
      const _isInShadow = isInShadow(point);
      let diffuse = max(vec3.dot(normal, dirLight), 0);
      let _shadow = mix(shadowStrength, 1.0, _isInShadow ? 0 : 1);
      let _isBehindObject = isBehindObject(point);
      // let depth = isBehindObject(point);

      let shade = _shadow * diffuse;
      shade = pow(shade, 1.5);
      shade = smoothstep(0.0, 0.75, shade);
      if (_isBehindObject) {
        shade = 0;
      }

      // shadow space position
      lineData.debug = _isInShadow ? [1, 0, 0] : [0, 1, 0];
      lineData.debug = _isBehindObject ? [1, 0, 0] : [0, 1, 0];
      lineData.shade = shade;
    });
  });
}
