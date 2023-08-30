const _resize = (canvas, w, h) => {
  const { innerWidth, innerHeight } = window;

  w = w || innerWidth;
  h = h || innerHeight;

  let tw = Math.min(w, innerWidth);
  let th = Math.min(h, innerHeight);

  const sx = innerWidth / w;
  const sy = innerHeight / h;
  const scale = Math.min(sx, sy);
  tw = w * scale;
  th = h * scale;
  const left = Math.floor(innerWidth - tw) / 2;
  const top = Math.floor(innerHeight - th) / 2;

  canvas.style.cssText = `
    position:absolute;
    width:${tw}px;
    height:${th}px;
    top:${top}px;
    left:${left}px;
  `;
};

const resize = (canvas, w, h) => {
  window.addEventListener("resize", () => {
    _resize(canvas, w, h);
  });
  _resize(canvas, w, h);
};

export default resize;
