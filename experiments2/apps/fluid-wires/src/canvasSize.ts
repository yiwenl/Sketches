export interface CanvasPixelSizeOptions {
  cssWidth: number;
  cssHeight: number;
  pixelRatio: number;
}

export interface CanvasPixelSize {
  width: number;
  height: number;
  pixelRatio: number;
}

export interface ResizableCanvas {
  clientWidth: number;
  clientHeight: number;
  width: number;
  height: number;
}

export function createCanvasPixelSize({
  cssWidth,
  cssHeight,
  pixelRatio,
}: CanvasPixelSizeOptions): CanvasPixelSize {
  const safePixelRatio =
    Number.isFinite(pixelRatio) && pixelRatio > 0 ? pixelRatio : 1;

  return {
    width: Math.max(1, Math.round(cssWidth * safePixelRatio)),
    height: Math.max(1, Math.round(cssHeight * safePixelRatio)),
    pixelRatio: safePixelRatio,
  };
}

export function syncCanvasPixelSize(
  canvas: ResizableCanvas,
  pixelRatio: number
): boolean {
  const { width, height } = createCanvasPixelSize({
    cssWidth: canvas.clientWidth,
    cssHeight: canvas.clientHeight,
    pixelRatio,
  });

  if (canvas.width === width && canvas.height === height) {
    return false;
  }

  canvas.width = width;
  canvas.height = height;
  return true;
}
