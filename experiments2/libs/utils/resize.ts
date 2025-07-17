let _canvas: HTMLCanvasElement;
let _w: number;
let _h: number;
let _margin: number = 0;

const _resize = (
  canvas: HTMLCanvasElement,
  w: number,
  h: number,
  margin: number = 0
) => {
  const { innerWidth, innerHeight } = window;

  w = w || innerWidth;
  h = h || innerHeight;

  const targetWidth = innerWidth - margin * 2;
  const targetHeight = innerHeight - margin * 2;

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

export const resize = (
  canvas: HTMLCanvasElement,
  w: number,
  h: number,
  margin: number = 0
) => {
  if (!canvas) {
    console.warn("resize: canvas is not defined");
    return;
  }
  _canvas = canvas;
  _w = w;
  _h = h;
  _margin = margin;
  window.addEventListener("resize", () => {
    _resize(canvas, w, h, margin);
  });
  _resize(canvas, w, h, margin);
};
