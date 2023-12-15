import { GLTexture } from "alfrid";

import { createCanvas } from "./utils/setupProject2D";
import { getText } from "./text";
import Config from "./Config";

const sortChars = (chars) => {
  const { numLevel: num } = Config;
  const mapSize = Math.floor(1024 / num);
  const { canvas, ctx } = createCanvas(mapSize, mapSize);
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = "white";

  const fontSize = mapSize;
  ctx.font = `${fontSize}px Noto Serif TC`;

  chars.sort((a, b) => {
    // Draw a and b to the canvas
    ctx.clearRect(0, 0, mapSize, mapSize);
    ctx.fillText(a, 0, 0);
    const aPixels = countBlankPixels(canvas);

    ctx.clearRect(0, 0, mapSize, mapSize);
    ctx.fillText(b, 0, 0);
    const bPixels = countBlankPixels(canvas);

    // Compare the number of blank pixels
    return bPixels - aPixels;
  });

  return chars;
};

const countBlankPixels = (canvas) => {
  const ctx = canvas.getContext("2d");
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  let count = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) {
      count++;
    }
  }
  return count;
};

export default function () {
  const { numLevel: num } = Config;
  const mapSize = 1024;
  // const { canvas, ctx } = createCanvas(mapSize, mapSize);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  canvas.width = mapSize;
  canvas.height = mapSize;

  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = "white";

  const fontSize = mapSize / num;
  ctx.font = `${fontSize}px Noto Serif TC`;
  let chars = getText();
  chars.length = num * num;
  sortChars(chars);
  for (let j = 0; j < num; j++) {
    for (let i = 0; i < num; i++) {
      const index = i + j * num;
      const char = chars[index - 1];
      if (index > 0) {
        ctx.fillText(char, i * fontSize, mapSize - j * fontSize - fontSize);
      }
    }
  }

  return new GLTexture(canvas);
}
