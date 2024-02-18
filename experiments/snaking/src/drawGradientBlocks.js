import { createCanvas } from "./utils/setupProject2D";

import { rgb } from "./utils";

export default function (
  trails,
  numXBlocks,
  numYBlocks,
  blockSize,
  marginBlock,
  threshold = 1
) {
  const { canvas, ctx } = createCanvas(
    numXBlocks * blockSize,
    numYBlocks * blockSize
  );

  const m = marginBlock * blockSize;
  const total = numXBlocks * numYBlocks;
  let count = 0;

  const getPos = (index) => {
    let x = index % numXBlocks;
    let y = Math.floor(index / numXBlocks);
    return { x, y };
  };

  trails.forEach((trail) => {
    trail.forEach((index, i) => {
      const p = count / total;

      if (p < threshold) {
        let x = (index % numXBlocks) * blockSize;
        let y = Math.floor(index / numXBlocks) * blockSize;
        const _s = blockSize - m * 2;
        // const g = randomInt(30, 50);
        let g = Math.floor(p * 255);
        ctx.fillStyle = rgb(g);
        ctx.fillRect(x + m, y + m, _s, blockSize - m * 2);
        count++;

        if (i > 0) {
          const prevHead = trail[i - 1];
          const { x: px, y: py } = getPos(prevHead);
          const { x: cx, y: cy } = getPos(index);
          const dx = cx - px;
          const dy = cy - py;

          x = px * blockSize;
          y = py * blockSize;
          if (dx === 1) {
            ctx.fillRect(x + m + _s, y + m, m * 2, _s);
          } else if (dx === -1) {
            ctx.fillRect(x + m, y + m, -m * 2, _s);
          }

          if (dy === 1) {
            ctx.fillRect(x + m, y + m + _s, _s, m * 2);
          } else if (dy === -1) {
            ctx.fillRect(x + m, y + m, _s, -m * 2);
          }
        }
      }
    });
  });

  return canvas;
}
