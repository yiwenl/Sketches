import { vec2 } from "gl-matrix";
import { vec3 } from "gl-matrix";

export const bezier2 = (mPoints, t) => {
  if (mPoints.length === 2) {
    const p = vec2.create();
    vec2.lerp(p, mPoints[0], mPoints[1], t);
    return p;
  }

  const a = [];
  for (let i = 0; i < mPoints.length - 1; i++) {
    const p = vec2.create();
    vec2.lerp(p, mPoints[i], mPoints[i + 1], t);
    a.push(p);
  }
  return bezier2(a, t);
};

export const bezier3 = (mPoints, t) => {
  if (mPoints.length === 2) {
    const p = vec3.create();
    vec3.lerp(p, mPoints[0], mPoints[1], t);
    return p;
  }

  const a = [];
  for (let i = 0; i < mPoints.length - 1; i++) {
    const p = vec3.create();
    vec3.lerp(p, mPoints[i], mPoints[i + 1], t);
    a.push(p);
  }
  return bezier3(a, t);
};
