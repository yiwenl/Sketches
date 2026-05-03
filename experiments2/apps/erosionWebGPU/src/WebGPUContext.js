class WebGPUContext {
  constructor() {
    this.adapter = null;
    this.device = null;
    this.context = null;
    this.format = null;
  }

  async init(canvas) {
    if (!navigator.gpu) {
      throw new Error("WebGPU not supported on this browser.");
    }

    this.adapter = await navigator.gpu.requestAdapter();
    if (!this.adapter) {
      throw new Error("No appropriate GPUAdapter found.");
    }

    this.device = await this.adapter.requestDevice();
    this.context = canvas.getContext("webgpu");

    this.format = navigator.gpu.getPreferredCanvasFormat();
    this.context.configure({
      device: this.device,
      format: this.format,
    });

    return {
      adapter: this.adapter,
      device: this.device,
      context: this.context,
      format: this.format,
    };
  }
}

export default new WebGPUContext();
