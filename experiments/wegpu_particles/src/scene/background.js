import backgroundShader from './shaders/background.wgsl?raw';
import { GPUUtils } from '../core/gpu_utils.js';

export class Background {
  constructor(device, format) {
    this.device = device;
    this.format = format;
    this.pipeline = null;
    this.uniformBuffer = null;
    this.bindGroup = null;

    this.init();
  }

  init() {
    this.uniformBuffer = GPUUtils.createBuffer(this.device, {
      label: 'Background Uniform Buffer',
      size: 32, // aspect + time + padding
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const shaderModule = this.device.createShaderModule({
      label: 'Background Shader',
      code: backgroundShader
    });

    this.pipeline = this.device.createRenderPipeline({
      label: 'Background Pipeline',
      layout: 'auto',
      vertex: {
        module: shaderModule,
        entryPoint: 'vs_main',
      },
      fragment: {
        module: shaderModule,
        entryPoint: 'fs_main',
        targets: [{ format: this.format }]
      },
      primitive: { topology: 'triangle-list' },
      depthStencil: {
        depthWriteEnabled: false,
        depthCompare: 'always',
        format: 'depth24plus',
      }
    });

    this.bindGroup = this.device.createBindGroup({
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.uniformBuffer } },
      ]
    });
  }

  render(pass, width, height, time) {
    const aspect = width / height;
    this.device.queue.writeBuffer(this.uniformBuffer, 0, new Float32Array([aspect, time]));

    pass.setPipeline(this.pipeline);
    pass.setBindGroup(0, this.bindGroup);
    pass.draw(6);
  }
}
