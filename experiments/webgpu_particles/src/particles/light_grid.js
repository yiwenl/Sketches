import lightGridShader from './shaders/light_grid.wgsl?raw';
import { processShader } from '../utils/shader_utils.js';

export class LightGrid {
  constructor(device, maxRadius) {
    this.device = device;
    this.maxRadius = maxRadius;
    this.gridSize = 64

    this.init();
  }

  init() {
    // 1. Accumulation Buffer (atomic u32)
    const bufferSize = this.gridSize * this.gridSize * this.gridSize * 4;
    this.gridBuffer = this.device.createBuffer({
      label: 'Light Grid Accumulation Buffer',
      size: bufferSize,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });

    // 2. Output 3D Texture
    this.texture = this.device.createTexture({
      label: 'Light Grid Texture',
      size: [this.gridSize, this.gridSize, this.gridSize],
      dimension: '3d',
      format: 'rgba16float',
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.COPY_DST,
    });

    // 3. Uniforms
    this.uniformData = new Float32Array(64); // Increased for 256-byte alignment
    this.uniformBuffer = this.device.createBuffer({
      label: 'Light Grid Uniform Buffer',
      size: this.uniformData.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    // 4. Unified Bind Group Layout
    this.layout = this.device.createBindGroupLayout({
      label: 'Light Grid Bind Group Layout',
      entries: [
        { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },
        { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
        { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
        { binding: 3, visibility: GPUShaderStage.COMPUTE, storageTexture: { access: 'write-only', format: 'rgba16float', viewDimension: '3d' } },
      ]
    });

    // 5. Pipelines
    const shaderModule = this.device.createShaderModule({
      label: 'Light Grid Shader',
      code: processShader(lightGridShader),
    });

    const pipelineLayout = this.device.createPipelineLayout({
      bindGroupLayouts: [this.layout]
    });

    this.splatPipeline = this.device.createComputePipeline({
      label: 'Light Grid Splat Pipeline',
      layout: pipelineLayout,
      compute: { module: shaderModule, entryPoint: 'splat' },
    });

    this.postPipeline = this.device.createComputePipeline({
      label: 'Light Grid Post Pipeline',
      layout: pipelineLayout,
      compute: { module: shaderModule, entryPoint: 'post_process' },
    });
  }

  createBindGroup(particleBuffer) {
    this.bindGroup = this.device.createBindGroup({
      label: 'Light Grid Bind Group',
      layout: this.layout,
      entries: [
        { binding: 0, resource: { buffer: this.uniformBuffer } },
        { binding: 1, resource: { buffer: particleBuffer } },
        { binding: 2, resource: { buffer: this.gridBuffer } },
        { binding: 3, resource: this.texture.createView({ dimension: '3d' }) },
      ],
    });
  }

  update(commandEncoder, particleBuffer, numParticles, deltaTime, glowIntensity) {
    if (!this.bindGroup) {
      this.createBindGroup(particleBuffer);
    }

    // Update Uniforms
    this.uniformData[0] = deltaTime;
    this.uniformData[1] = this.maxRadius;
    this.uniformData[2] = glowIntensity;
    this.uniformData[3] = 0.95; // Decay
    this.device.queue.writeBuffer(this.uniformBuffer, 0, this.uniformData);

    // Pass 1: Splatting
    const splatPass = commandEncoder.beginComputePass({ label: 'Light Grid Splat' });
    splatPass.setPipeline(this.splatPipeline);
    splatPass.setBindGroup(0, this.bindGroup);
    splatPass.dispatchWorkgroups(Math.ceil(numParticles / 64));
    splatPass.end();

    // Pass 2: Post Process
    const postPass = commandEncoder.beginComputePass({ label: 'Light Grid Post' });
    postPass.setPipeline(this.postPipeline);
    postPass.setBindGroup(0, this.bindGroup);
    const workgroupCount = this.gridSize / 4; // Matches 4x4x4 in shader
    postPass.dispatchWorkgroups(workgroupCount, workgroupCount, workgroupCount);
    postPass.end();
  }
}
