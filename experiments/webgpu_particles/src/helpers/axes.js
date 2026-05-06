import axesShader from './shaders/axes.wgsl?raw';
import { GPUUtils } from '../core/gpu_utils.js';

export class Axes {
  constructor(device, format) {
    this.device = device;
    this.format = format;
    this.pipeline = null;
    this.vertexBuffer = null;
    this.uniformBuffer = null;
    this.uniformBindGroup = null;

    this.init();
  }

  init() {
    // Axes Data (Position + Color)
    const axisLength = 100;
    const axesData = new Float32Array([
      // Position (x, y, z)    // Color (r, g, b)
      -axisLength, 0, 0,       1, 0, 0, // X-axis
       axisLength, 0, 0,       1, 0, 0,
      0, -axisLength, 0,       0, 1, 0, // Y-axis
      0,  axisLength, 0,       0, 1, 0,
      0, 0, -axisLength,       0, 0, 1, // Z-axis
      0, 0,  axisLength,       0, 0, 1,
    ]);

    this.vertexBuffer = GPUUtils.createBuffer(this.device, {
      label: 'Axes Vertex Buffer',
      data: axesData,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });

    this.uniformBuffer = GPUUtils.createBuffer(this.device, {
      label: 'Axes Uniform Buffer',
      size: 16 * 4,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const shaderModule = this.device.createShaderModule({
      label: 'Axes Shader',
      code: axesShader
    });

    this.pipeline = this.device.createRenderPipeline({
      label: 'Axes Pipeline',
      layout: 'auto',
      vertex: {
        module: shaderModule,
        entryPoint: 'vs_main',
        buffers: [{
          arrayStride: 6 * 4,
          attributes: [
            { shaderLocation: 0, offset: 0, format: 'float32x3' }, // Position
            { shaderLocation: 1, offset: 3 * 4, format: 'float32x3' } // Color
          ]
        }]
      },
      fragment: {
        module: shaderModule,
        entryPoint: 'fs_main',
        targets: [{ format: this.format }]
      },
      primitive: { topology: 'line-list' },
      depthStencil: {
        depthWriteEnabled: true,
        depthCompare: 'less',
        format: 'depth24plus',
      }
    });

    this.uniformBindGroup = this.device.createBindGroup({
      label: 'Axes Bind Group',
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [{
        binding: 0,
        resource: { buffer: this.uniformBuffer }
      }]
    });
  }

  render(pass, camera) {
    this.device.queue.writeBuffer(this.uniformBuffer, 0, camera.viewProjectionMatrix);

    pass.setPipeline(this.pipeline);
    pass.setBindGroup(0, this.uniformBindGroup);
    pass.setVertexBuffer(0, this.vertexBuffer);
    pass.draw(6);
  }
}
