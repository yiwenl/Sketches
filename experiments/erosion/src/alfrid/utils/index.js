import { mat4, glMatrix } from "gl-matrix";
export { checkWebGL2 } from "./checkWebGL2";
export { getExtensions } from "./getExtensions";
export { isMobile } from "./isMobile";

export const checkViewport = (viewport, x, y, w, h) => {
  let hasChanged = false;
  if (x !== viewport[0]) {
    hasChanged = true;
  }
  if (y !== viewport[1]) {
    hasChanged = true;
  }
  if (w !== viewport[2]) {
    hasChanged = true;
  }
  if (h !== viewport[3]) {
    hasChanged = true;
  }
  return hasChanged;
};

export const equals = (a, b) => {
  if (typeof a === "number") {
    return glMatrix.equals(a, b);
  }

  if (a.length !== b.length) {
    return false;
  }

  let _isEqual = true;
  a.forEach((v, i) => {
    _isEqual = glMatrix.equals(v, b[i]) && _isEqual;
  });
  return _isEqual;
};

export const getMouse = (e) => {
  let x, y;

  if (e.touches) {
    x = e.touches[0].pageX;
    y = e.touches[0].pageY;
  } else {
    x = e.clientX;
    y = e.clientY;
  }

  return {
    x,
    y,
  };
};

/*
mat4.log = function(m) {
  const a = [];
  for (let i = 0; i < 4; i++) {
    const b = [];
    for (let j = 0; j < 4; j++) {
      b.push(m[i * 4 + j]);
    }
    a.push(b);
  }
  console.table(a);
};
*/
