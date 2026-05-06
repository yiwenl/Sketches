import { Constants } from '../constants.js';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.device = null;
    this.context = null;
    this.format = null;
    this.useHdr = false;
    this.depthTexture = null;
    this.sceneTexture = null;
    this.sceneView = null;
    this.renderCallbacks = [];
    this.updateCallbacks = [];
    this.resizeCallbacks = [];
    this.postRenderCallbacks = [];

    // Time tracking
    this.lastTime = 0;
    this.totalTime = Math.random() * 10000;
    this.targetFPS = 0; // 0 means uncapped
    this.accumulatedTime = 0;

    this.onResize = this.onResize.bind(this);
    this.render = this.render.bind(this);
  }

  async init() {
    if (!navigator.gpu) {
      throw new Error('WebGPU not supported');
    }

    const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
    if (!adapter) {
      throw new Error('No WebGPU adapter found');
    }

    this.device = await adapter.requestDevice();
    this.context = this.canvas.getContext('webgpu');
    const preferredFormat = navigator.gpu.getPreferredCanvasFormat();
    const hdrInfo = this.getHdrSupportInfo(this.context, adapter);
    this.useHdr = hdrInfo.supported;
    this.format = this.useHdr ? 'rgba16float' : preferredFormat;
    console.log('WebGPU preferred format:', preferredFormat);
    console.log('HDR support info:', hdrInfo);
    console.log('useHdr:', this.useHdr, 'canvasFormat:', this.format);

    window.addEventListener('resize', this.onResize);
    this.onResize();

    return this.device;
  }

  getHdrSupportInfo(context, adapter) {
    if (!context) {
      return { supported: false, reason: 'GPUCanvasContext is unavailable' };
    }

    const hasGetCapabilities = typeof context.getCapabilities === 'function';
    let formats = [];
    let colorSpaces = [];

    if (hasGetCapabilities) {
      try {
        const capabilities = context.getCapabilities(adapter);
        formats = capabilities?.formats ?? [];
        colorSpaces = capabilities?.colorSpaces ?? [];
      } catch (error) {
        return {
          supported: false,
          reason: 'getCapabilities(adapter) threw',
          error: String(error),
        };
      }

      if (!formats.includes('rgba16float')) {
        return {
          supported: false,
          reason: 'rgba16float not present in context capabilities',
          formats,
          colorSpaces,
        };
      }

      if (colorSpaces.length > 0 && !colorSpaces.includes('display-p3')) {
        return {
          supported: false,
          reason: 'display-p3 not present in context capabilities',
          formats,
          colorSpaces,
        };
      }
    }

    // Some browsers do not expose tone-mapping support via capabilities.
    // Probe with a real configure call and fallback if it throws.
    try {
      context.configure({
        device: this.device,
        format: 'rgba16float',
        alphaMode: 'premultiplied',
        colorSpace: 'display-p3',
        toneMapping: { mode: 'extended' },
      });
    } catch (error) {
      return {
        supported: false,
        reason: 'context.configure rejected HDR configuration',
        formats,
        colorSpaces,
        error: String(error),
      };
    }

    return {
      supported: true,
      reason: hasGetCapabilities
        ? 'HDR format/color space/tone mapping probe succeeded'
        : 'getCapabilities unavailable, but HDR configure probe succeeded',
      formats,
      colorSpaces,
    };
  }

  onResize() {
    if (!this.device) return;

    let width, height;
    const dpr = Constants.pixelRatio || window.devicePixelRatio || 1;

    if (Constants.useTargetDimension) {
      const [targetW, targetH] = Constants.targetDimension;

      // Internal resolution scaled by dpr
      this.canvas.width = targetW * dpr;
      this.canvas.height = targetH * dpr;

      const windowW = window.innerWidth;
      const windowH = window.innerHeight;
      const scale = Math.min(windowW / targetW, windowH / targetH);

      const displayW = targetW * scale;
      const displayH = targetH * scale;

      // CSS display size
      this.canvas.style.width = `${displayW}px`;
      this.canvas.style.height = `${displayH}px`;
      this.canvas.style.position = 'absolute';
      this.canvas.style.left = '50%';
      this.canvas.style.top = '50%';
      this.canvas.style.transform = 'translate(-50%, -50%)';

      width = targetW * dpr;
      height = targetH * dpr;
    } else {
      const windowW = window.innerWidth;
      const windowH = window.innerHeight;

      this.canvas.width = Math.max(1, windowW * dpr);
      this.canvas.height = Math.max(1, windowH * dpr);
      this.canvas.style.width = `${windowW}px`;
      this.canvas.style.height = `${windowH}px`;
      this.canvas.style.position = '';
      this.canvas.style.left = '';
      this.canvas.style.top = '';
      this.canvas.style.transform = '';

      width = this.canvas.width;
      height = this.canvas.height;
    }

    const contextConfig = {
      device: this.device,
      format: this.format,
      alphaMode: 'premultiplied',
      colorSpace: 'display-p3',
    };

    if (this.useHdr) {
      contextConfig.toneMapping = { mode: 'extended' };
    }

    this.context.configure(contextConfig);

    this.depthTexture = this.device.createTexture({
      size: [this.canvas.width, this.canvas.height],
      format: 'depth24plus',
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });

    if (this.sceneTexture) this.sceneTexture.destroy();
    this.sceneTexture = this.device.createTexture({
      label: 'Scene Texture',
      size: [this.canvas.width, this.canvas.height],
      format: this.format,
      usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
    });
    this.sceneView = this.sceneTexture.createView();

    // Notify listeners
    this.resizeCallbacks.forEach(cb => cb(width, height));
  }

  addRenderCallback(callback) {
    this.renderCallbacks.push(callback);
  }

  addUpdateCallback(callback) {
    this.updateCallbacks.push(callback);
  }

  addResizeCallback(callback) {
    this.resizeCallbacks.push(callback);
  }

  addPostRenderCallback(callback) {
    this.postRenderCallbacks.push(callback);
  }

  start() {
    requestAnimationFrame(this.render);
  }

  render(timestamp = performance.now()) {
    if (!this.device || !this.context) return;

    if (!this.lastTime) this.lastTime = timestamp;
    const frameTime = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;

    if (this.targetFPS > 0) {
      this.accumulatedTime += frameTime;
      const targetFrameDuration = 1 / this.targetFPS;

      if (this.accumulatedTime < targetFrameDuration) {
        requestAnimationFrame(this.render);
        return;
      }

      // We are ready to render a frame
      const deltaTime = Math.min(0.1, this.accumulatedTime);
      this.accumulatedTime -= targetFrameDuration;
      // Handle catch-up if we fall behind too much
      if (this.accumulatedTime > targetFrameDuration) {
        this.accumulatedTime = 0;
      }

      this.totalTime += deltaTime;
      this.executeFrame(deltaTime);
    } else {
      const deltaTime = Math.min(0.1, frameTime);
      this.totalTime += deltaTime;
      this.executeFrame(deltaTime);
    }

    requestAnimationFrame(this.render);
  }

  executeFrame(deltaTime) {
    // Execute update callbacks (Compute, Physics, etc.)
    this.updateCallbacks.forEach(cb => cb(deltaTime, this.totalTime));

    const encoder = this.device.createCommandEncoder();
    const depthView = this.depthTexture.createView();

    const pass = encoder.beginRenderPass({
      colorAttachments: [{
        view: this.sceneView,
        clearValue: { r: 0.1, g: 0.098, b: 0.094, a: 1.0 }, // Dark grey background
        loadOp: 'clear',
        storeOp: 'store',
      }],
      depthStencilAttachment: {
        view: depthView,
        depthClearValue: 1.0,
        depthLoadOp: 'clear',
        depthStoreOp: 'store',
      }
    });

    // Execute render callbacks
    this.renderCallbacks.forEach(cb => cb(pass, deltaTime, this.totalTime));

    pass.end();

    // --- POST PASS (Scene -> Screen) ---
    const screenView = this.context.getCurrentTexture().createView();
    const postPass = encoder.beginRenderPass({
      colorAttachments: [{
        view: screenView,
        loadOp: 'clear',
        clearValue: { r: 0, g: 0, b: 0, a: 1 },
        storeOp: 'store',
      }]
    });

    this.postRenderCallbacks.forEach(cb => cb(postPass, deltaTime, this.totalTime));

    postPass.end();

    this.device.queue.submit([encoder.finish()]);
  }
}
