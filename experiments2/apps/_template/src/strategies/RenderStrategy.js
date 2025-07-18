import { GL } from "@alfrid";
import { resize, addFullscreenToggle } from "@utils";
import { targetWidth, targetHeight, pixelRatio } from "../features";
import Config from "../Config";

export class RenderStrategy {
  init(canvas) {
    throw new Error("init() must be implemented by subclass");
  }

  resize(camera) {
    throw new Error("resize() must be implemented by subclass");
  }
}

export class TargetSizeStrategy extends RenderStrategy {
  init(canvas) {
    GL.setSize(targetWidth, targetHeight);
    resize(canvas, targetWidth, targetHeight, Config.margin);
  }

  resize(camera) {
    // Target size doesn't need resize handling
    // But we should update camera aspect ratio if provided
    if (camera) {
      camera.setAspectRatio(GL.aspectRatio);
    }
  }
}

export class FullscreenStrategy extends RenderStrategy {
  init() {
    const { innerWidth, innerHeight } = window;
    GL.setSize(innerWidth * pixelRatio, innerHeight * pixelRatio);
    addFullscreenToggle();
  }

  resize(camera) {
    const { innerWidth, innerHeight } = window;
    GL.setSize(innerWidth * pixelRatio, innerHeight * pixelRatio);
    if (camera) {
      camera.setAspectRatio(GL.aspectRatio);
    }
  }
}
