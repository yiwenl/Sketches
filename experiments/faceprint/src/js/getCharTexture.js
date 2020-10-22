import alfrid from "alfrid";
import Sutra from "./sutra";
const FONT = `Toppan Bunkyu Midashi Mincho`;

const getCharTexture = () => {
  const _s = Sutra.split("。")
    .join("")
    .split("　")
    .join("");

  const words = [];
  for (let i = 0; i < _s.length; i++) {
    const char = _s.substring(i, i + 1);
    if (words.indexOf(char) === -1) {
      words.push(char);
    }
  }
  // create texture
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  canvas.className = "canvas-char";
  const ctx = canvas.getContext("2d");
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = "white";

  const num = 12;
  const gap = canvas.width / num;
  const fontSize = Math.floor(canvas.width / num);

  for (let i = 0; i < num; i++) {
    for (let j = 0; j < num; j++) {
      let index = i + j * num;
      if (index >= words.length) {
        index = Math.floor(Math.random() * words.length);
      }
      const char = words[index];
      ctx.font = `${fontSize}px ${FONT}`;
      ctx.fillText(char, i * gap, j * gap);
    }
  }

  const textureChars = new alfrid.GLTexture(canvas);

  return textureChars;
};

export default getCharTexture;
