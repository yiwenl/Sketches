import "./Capture";
import resize from "./resize";

export const createCanvas = (width, height) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  return { canvas, ctx };
};

const setupProject = (width, height) => {
  const { canvas, ctx } = createCanvas(width, height);
  canvas.id = "main-canvas";
  document.body.appendChild(canvas);

  resize(canvas, width, height);

  return { canvas, ctx, width, height };
};

export default setupProject;
