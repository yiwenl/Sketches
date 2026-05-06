import { processShader } from '../utils/shader_utils.js';
import visualizerShader from './shaders/fluid_visualizer.wgsl?raw';
import { GPUUtils } from '../core/gpu_utils.js';

export class FluidVisualizer {
  constructor(device, format, gridRes = 48, maxRadius = 7) {
    this.device = device;
    this.format = format;
    this.gridRes = gridRes;
    this.maxRadius = maxRadius;
    
    this.pipeline = null;
    this.vertexBuffer = null;
    this.indexBuffer = null;
    this.uniformBuffer = null;
    this.bindGroup = null;
    this.sampler = null;
    this.colorMode = 0; // 0: speed, 1: direction

    this.init();
  }

  init() {
    // 1. Needle Geometry (elongated box)
    const vertices = new Float32Array([
        // Cube vertices (0 to 1 range on X, -0.5 to 0.5 on Y/Z)
        0, -0.5, -0.5,  // 0
        1, -0.5, -0.5,  // 1
        1,  0.5, -0.5,  // 2
        0,  0.5, -0.5,  // 3
        0, -0.5,  0.5,  // 4
        1, -0.5,  0.5,  // 5
        1,  0.5,  0.5,  // 6
        0,  0.5,  0.5,  // 7
    ]);
    
    const indices = new Uint16Array([
        0, 1, 2, 0, 2, 3, // back
        4, 5, 6, 4, 6, 7, // front
        0, 4, 7, 0, 7, 3, // left
        1, 5, 6, 1, 6, 2, // right
        3, 2, 6, 3, 6, 7, // top
        0, 1, 5, 0, 5, 4, // bottom
    ]);

    this.vertexBuffer = GPUUtils.createBuffer(this.device, {
        label: 'Fluid Visualizer Vertex Buffer',
        data: vertices,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    });

    this.indexBuffer = GPUUtils.createBuffer(this.device, {
        label: 'Fluid Visualizer Index Buffer',
        data: indices,
        usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
    });

    this.uniformBuffer = GPUUtils.createBuffer(this.device, {
        label: 'Fluid Visualizer Uniform Buffer',
        size: 20 * 4, // mat4(64) + maxRadius(4) + gridRes(4) + colorMode(4) + padding(4)
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });

    this.sampler = this.device.createSampler({
        magFilter: 'nearest',
        minFilter: 'nearest',
    });

    const shaderModule = this.device.createShaderModule({
      label: 'Fluid Visualizer Shader',
      code: processShader(visualizerShader)
    });

    this.pipeline = this.device.createRenderPipeline({
        layout: 'auto',
        vertex: {
            module: shaderModule,
            entryPoint: 'vs_main',
            buffers: [{
                arrayStride: 3 * 4,
                attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x3' }]
            }]
        },
        fragment: {
            module: shaderModule,
            entryPoint: 'fs_main',
            targets: [{ 
                format: this.format,
                blend: {
                    color: { srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha', operation: 'add' },
                    alpha: { srcFactor: 'zero', dstFactor: 'one', operation: 'add' },
                }
            }]
        },
        primitive: { topology: 'triangle-list' },
        depthStencil: {
            depthWriteEnabled: true,
            depthCompare: 'less',
            format: 'depth24plus',
        }
    });
  }

  render(pass, camera, fluidSystem) {
    if (!this.pipeline) return;

    const res = this.gridRes;
    const downsample = 3;
    const visualRes = Math.floor(res / downsample);
    const numInstances = visualRes * visualRes * visualRes;

    const uniformData = new Float32Array(20);
    uniformData.set(camera.viewProjectionMatrix, 0);
    uniformData[16] = this.maxRadius;
    uniformData[17] = res;
    uniformData[18] = this.colorMode;
    this.device.queue.writeBuffer(this.uniformBuffer, 0, uniformData);

    const bindGroup = this.device.createBindGroup({
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.uniformBuffer } },
        { binding: 1, resource: fluidSystem.velocity.createView() },
        { binding: 2, resource: fluidSystem.density.createView() },
        { binding: 3, resource: this.sampler }
      ]
    });

    pass.setPipeline(this.pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.setVertexBuffer(0, this.vertexBuffer);
    pass.setIndexBuffer(this.indexBuffer, 'uint16');
    pass.drawIndexed(36, numInstances);
  }
}
