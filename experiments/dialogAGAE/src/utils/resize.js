import Config from "../Config";

let _canvas, _w, _h;

const _resize = (canvas, w, h) => {
  const { margin } = Config;
  const { innerWidth, innerHeight } = window;

  w = w || innerWidth;
  h = h || innerHeight;

  const targetWidth = innerWidth - margin;
  const targetHeight = innerHeight - margin;

  let tw = Math.min(w, targetWidth);
  let th = Math.min(h, targetHeight);

  const sx = targetWidth / w;
  const sy = targetHeight / h;
  const scale = Math.min(sx, sy);
  tw = w * scale;
  th = h * scale;
  let left = Math.floor(innerWidth - tw) / 2;
  const top = Math.floor(innerHeight - th) / 2;

  let style = `
  position:absolute;
  width:${tw}px;
  height:${th}px;
  top:${top}px;
  left:${left}px;
  `;
  if (process.env.NODE_ENV === "development") {
    style += `
    box-shadow:5px 10px 10px rgba(0, 0, 0, 0.25);
    `;
  }

  canvas.style.cssText = style;
};

export const resizeUpdate = () => {
  if (_canvas) {
    _resize(_canvas, _w, _h);
  }
};

const resize = (canvas, w, h) => {
  _canvas = canvas;
  _w = w;
  _h = h;
  window.addEventListener("resize", () => {
    _resize(canvas, w, h);
  });
  _resize(canvas, w, h);
};

export default resize;
