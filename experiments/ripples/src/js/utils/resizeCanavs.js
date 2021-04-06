// resizeCanavs.js

import { GL } from "alfrid";

const resize = (w, h) => {
  const { innerWidth, innerHeight } = window;

  w = w || innerWidth;
  h = h || innerHeight;

  GL.setSize(w, h);
  let tw = Math.min(w, innerWidth);
  let th = Math.min(h, innerHeight);

  const sx = innerWidth / w;
  const sy = innerHeight / h;
  const scale = Math.min(sx, sy);
  tw = w * scale;
  th = h * scale;

  GL.canvas.style.width = `${tw}px`;
  GL.canvas.style.height = `${th}px`;
};

export { resize };
