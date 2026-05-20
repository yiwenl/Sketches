import { GL } from "@alfrid";
import { resize, addFullscreenToggle } from "@utils";
import { targetWidth, targetHeight, pixelRatio } from "../features";
import Config from "../Config";

function checkHDRSupport(targetWidth, targetHeight) {
  const gl = GL.gl;
  if ("drawingBufferColorSpace" in gl) {
    gl.drawingBufferColorSpace = "display-p3";
  }
  if ("drawingBufferStorage" in gl) {
    gl.drawingBufferStorage(gl.RGBA16F, targetWidth, targetHeight);
  }
}

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

    checkHDRSupport(targetWidth, targetHeight);
  }

  resize(camera) {
    // Target size doesn't need resize handling
    // But we should update camera aspect ratio if provided
    if (camera) {
      camera.setAspectRatio(GL.aspectRatio);
    }
    checkHDRSupport(targetWidth, targetHeight);
  }
}

export class FullscreenStrategy extends RenderStrategy {
  init() {
    const { innerWidth, innerHeight } = window;
    GL.setSize(innerWidth * pixelRatio, innerHeight * pixelRatio);
    addFullscreenToggle();
    checkHDRSupport(GL.width, GL.height);
  }

  resize(camera) {
    const { innerWidth, innerHeight } = window;
    GL.setSize(innerWidth * pixelRatio, innerHeight * pixelRatio);
    if (camera) {
      camera.setAspectRatio(GL.aspectRatio);
    }

    checkHDRSupport(GL.width, GL.height);
  }
}
