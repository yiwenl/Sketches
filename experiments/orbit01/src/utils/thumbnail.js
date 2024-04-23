import { createCanvas } from "./setupProject2D";
import Config from "../Config";
let targetCanvas, canvas, ctx;

export default function addPreview(mTargetCanvas, mFreq = 2000) {
  targetCanvas = mTargetCanvas;
  const { width, height } = mTargetCanvas;
  setInterval(update, mFreq);
  const o = createCanvas(width, height);
  canvas = o.canvas;
  ctx = o.ctx;

  resizeThumbnail();
  update();
}

function update() {
  console.log("update");
  ctx.drawImage(targetCanvas, 0, 0);
}

export function resizeThumbnail() {
  const { width, height } = targetCanvas;
  const ratio = width / height;
  const w = Config.thumbnailSize;
  const h = Math.floor(w / ratio);
  document.body.appendChild(canvas);
  canvas.style.cssText = `
  position:absolute;
  bottom:0;
  right:0;
  width:${w}px;
  height:${h}px;
  z-index:9999;
  `;
}
