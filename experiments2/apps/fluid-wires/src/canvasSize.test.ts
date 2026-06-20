import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createCanvasPixelSize, syncCanvasPixelSize } from "./canvasSize.js";

describe("canvasSize", () => {
  it("scales CSS canvas dimensions by device pixel ratio", () => {
    assert.deepEqual(
      createCanvasPixelSize({
        cssWidth: 800,
        cssHeight: 450,
        pixelRatio: 2,
      }),
      { width: 1600, height: 900, pixelRatio: 2 }
    );
  });

  it("falls back to a ratio of 1 for invalid pixel ratios", () => {
    assert.deepEqual(
      createCanvasPixelSize({
        cssWidth: 640,
        cssHeight: 360,
        pixelRatio: 0,
      }),
      { width: 640, height: 360, pixelRatio: 1 }
    );
  });

  it("updates the backing store only when dimensions change", () => {
    const canvas = {
      clientWidth: 300,
      clientHeight: 200,
      width: 300,
      height: 200,
    };

    assert.equal(syncCanvasPixelSize(canvas, 2), true);
    assert.equal(canvas.width, 600);
    assert.equal(canvas.height, 400);
    assert.equal(syncCanvasPixelSize(canvas, 2), false);
  });
});
