import postShader from './shaders/post_process.wgsl?raw';
import { GPUUtils } from '../core/gpu_utils.js';

export class PostProcess {
  constructor(device, format) {
    this.device = device;
    this.format = format;
    
    this.pipeline = null;
    this.uniformBuffer = null;
    this.bindGroup = null;
    this.sampler = null;
    
    this.init();
  }

  init() {
    this.uniformBuffer = GPUUtils.createBuffer(this.device, {
      label: 'PostProcess Uniform Buffer',
      size: 16, // time, intensity
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    this.sampler = this.device.createSampler({
      magFilter: 'linear',
      minFilter: 'linear',
    });

    const shaderModule = this.device.createShaderModule({
      label: 'PostProcess Shader',
      code: postShader,
    });

    this.pipeline = this.device.createRenderPipeline({
      label: 'PostProcess Pipeline',
      layout: 'auto',
      vertex: {
        module: shaderModule,
        entryPoint: 'vs_main',
      },
      fragment: {
        module: shaderModule,
        entryPoint: 'fs_main',
        targets: [{ format: this.format }],
      },
      primitive: { topology: 'triangle-list' },
    });
  }

  updateBindGroup(sceneView) {
    this.bindGroup = this.device.createBindGroup({
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.uniformBuffer } },
        { binding: 1, resource: sceneView },
        { binding: 2, resource: this.sampler },
      ],
    });
  }

  render(pass, time, grainIntensity, vignetteIntensity, aspect) {
    if (!this.bindGroup) return;

    this.device.queue.writeBuffer(this.uniformBuffer, 0, new Float32Array([time, grainIntensity, vignetteIntensity, aspect]));

    pass.setPipeline(this.pipeline);
    pass.setBindGroup(0, this.bindGroup);
    pass.draw(3); // Full-screen triangle
  }
}
