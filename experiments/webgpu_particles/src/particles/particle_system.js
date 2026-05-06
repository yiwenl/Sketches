import particleShader from './shaders/particles.wgsl?raw';
import simulationShader from './shaders/simulation.wgsl?raw';
import { ParticleData } from './particle_data.js';
import { processShader } from '../utils/shader_utils.js';
import { GPUUtils } from '../core/gpu_utils.js';
import { mat4, vec3 } from 'gl-matrix';
import { LightGrid } from './light_grid.js';

export class ParticleSystem {
  constructor(device, format, shadowDepthTexture, fluidVelocityTextures, fluidDensityTextures, colorMap1Texture, colorMap2Texture, numParticles = 800000, config = {}) {
    this.device = device;
    this.format = format;
    this.shadowDepthTexture = shadowDepthTexture;
    this.fluidVelocityTextures = fluidVelocityTextures;
    this.fluidDensityTextures = fluidDensityTextures;
    this.colorMap1Texture = colorMap1Texture;
    this.colorMap2Texture = colorMap2Texture;
    this.numParticles = numParticles;

    this.config = Object.assign({
      maxRadius: 7,
      sphereRadius: 4,
      particleScale: 0.4,
      noiseScale: 0.4,
      forceStrength: 1.5,
      speedScale: 0.3,
      maxSpeed: 0.2,
      shadowScaleBoost: 2.0
    }, config);

    this.particles = new ParticleData(this.numParticles, this.config);
    this.lightGrid = new LightGrid(this.device, this.config.maxRadius);
    this.pipeline = null;
    this.simulationPipeline = null;
    this.particleBuffer = null;
    this.quadBuffer = null;
    this.uniformBuffer = null;
    this.simParamsBuffer = null;
    this.bindGroup = null;
    this.shadowBindGroup = null;
    this.shadowSampler = null;
    this.linearSampler = null;

    this.init();
  }

  init() {
    // 1. Particle Buffer (Storage enabled)
    this.particleBuffer = GPUUtils.createBuffer(this.device, {
      label: 'Particle Buffer',
      data: this.particles.buffer,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });

    // 2. Quad Geometry
    const quadVertices = new Float32Array([
      -0.5, -0.5,
      0.5, -0.5,
      -0.5, 0.5,
      -0.5, 0.5,
      0.5, -0.5,
      0.5, 0.5,
    ]);
    this.quadBuffer = GPUUtils.createBuffer(this.device, {
      label: 'Quad Vertex Buffer',
      data: quadVertices,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });

    // 3. Render Uniforms (View, Proj, ShadowMatrix, LightPos, SpotParams)
    this.uniformData = new Float32Array(64); // 256 bytes
    this.uniformBuffer = GPUUtils.createBuffer(this.device, {
      label: 'Particle Uniform Buffer',
      size: 256,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    // 4. Simulation Uniforms
    this.simParamsBuffer = GPUUtils.createBuffer(this.device, {
      label: 'Simulation Params Buffer',
      size: 32, // 8 * 4
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    this.simParamsData = new Float32Array(8)

    // 5. Shadow Uniforms
    this.shadowUniformData = new Float32Array(64); // 256 bytes
    this.shadowUniformBuffer = GPUUtils.createBuffer(this.device, {
      label: 'Shadow Uniform Buffer',
      size: 256,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    this.shadowSampler = this.device.createSampler({
      compare: 'less',
      magFilter: 'linear',
      minFilter: 'linear',
    });

    this.linearSampler = this.device.createSampler({
      magFilter: 'linear',
      minFilter: 'linear',
    });

    this.nearestSampler = this.device.createSampler({
      magFilter: 'nearest',
      minFilter: 'nearest',
    });

    // --- RENDER PIPELINE ---
    const shaderModule = this.device.createShaderModule({
      label: 'Particle Shader',
      code: processShader(particleShader)
    });

    const vertexBuffers = [
      {
        arrayStride: 8,
        stepMode: 'vertex',
        attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x2' }]
      },
      {
        arrayStride: this.particles.byteStride,
        stepMode: 'instance',
        attributes: [
          { shaderLocation: 1, offset: 0, format: 'float32x3' },
          { shaderLocation: 2, offset: 16, format: 'float32x3' },
          { shaderLocation: 3, offset: 32, format: 'float32x3' },
          { shaderLocation: 4, offset: 44, format: 'float32' },
          { shaderLocation: 5, offset: 48, format: 'float32x3' },
          { shaderLocation: 6, offset: 76, format: 'float32' }
        ]
      }
    ];

    this.pipeline = this.device.createRenderPipeline({
      label: 'Particle Pipeline',
      layout: 'auto',
      vertex: {
        module: shaderModule,
        entryPoint: 'vs_main',
        buffers: vertexBuffers
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

    this.bindGroup = this.device.createBindGroup({
      label: 'Particle Bind Group',
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.uniformBuffer } },
        { binding: 1, resource: this.shadowDepthTexture.createView() },
        { binding: 2, resource: this.shadowSampler },
        { binding: 3, resource: this.colorMap1Texture.createView() },
        { binding: 4, resource: this.nearestSampler },
        { binding: 5, resource: this.colorMap2Texture.createView() },
        { binding: 6, resource: this.lightGrid.texture.createView({ dimension: '3d' }) },
        { binding: 7, resource: this.linearSampler }
      ]
    });

    // --- SHADOW PIPELINE ---
    this.shadowPipeline = this.device.createRenderPipeline({
      label: 'Shadow Pipeline',
      layout: 'auto',
      vertex: {
        module: shaderModule,
        entryPoint: 'vs_main',
        buffers: vertexBuffers
      },
      fragment: {
        module: shaderModule,
        entryPoint: 'fs_shadow',
        targets: []
      },
      primitive: { topology: 'triangle-list' },
      depthStencil: {
        depthWriteEnabled: true,
        depthCompare: 'less',
        format: 'depth32float',
      }
    });

    this.shadowBindGroup = this.device.createBindGroup({
      label: 'Shadow Bind Group',
      layout: this.shadowPipeline.getBindGroupLayout(0),
      entries: [{
        binding: 0,
        resource: { buffer: this.shadowUniformBuffer }
      }]
    });

    // --- COMPUTE PIPELINE ---
    const simShaderModule = this.device.createShaderModule({
      label: 'Simulation Shader',
      code: processShader(simulationShader),
    });

    this.simulationPipeline = this.device.createComputePipeline({
      layout: 'auto',
      compute: { module: simShaderModule, entryPoint: 'main' },
    });

    // --- BIND GROUP CACHING ---
    this.simulationBindGroups = [
      this.device.createBindGroup({
        layout: this.simulationPipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: this.simParamsBuffer } },
          { binding: 1, resource: { buffer: this.particleBuffer } },
          { binding: 2, resource: this.fluidVelocityTextures[0].createView() },
          { binding: 3, resource: this.linearSampler },
          { binding: 4, resource: this.fluidDensityTextures[0].createView() }
        ]
      }),
      this.device.createBindGroup({
        layout: this.simulationPipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: this.simParamsBuffer } },
          { binding: 1, resource: { buffer: this.particleBuffer } },
          { binding: 2, resource: this.fluidVelocityTextures[1].createView() },
          { binding: 3, resource: this.linearSampler },
          { binding: 4, resource: this.fluidDensityTextures[1].createView() }
        ]
      })
    ];
  }

  update(deltaTime, totalTime, fluidVelocityTexture, fluidDensityTexture, vIn, dIn) {
    // Update Uniforms
    this.simParamsData[0] = deltaTime;
    this.simParamsData[1] = totalTime * 0.2;
    this.simParamsData[2] = this.config.maxRadius;
    this.simParamsData[3] = this.config.noiseScale;
    this.simParamsData[4] = this.config.forceStrength;
    this.simParamsData[5] = this.config.speedScale;
    this.simParamsData[6] = this.config.maxSpeed;

    this.device.queue.writeBuffer(this.simParamsBuffer, 0, this.simParamsData);

    const commandEncoder = this.device.createCommandEncoder();
    const passEncoder = commandEncoder.beginComputePass();
    passEncoder.setPipeline(this.simulationPipeline);

    // Use vIn to select the correct bind group (synchronized with FluidSystem)
    passEncoder.setBindGroup(0, this.simulationBindGroups[vIn]);

    const workgroupSize = 64;
    const workgroupCount = Math.ceil(this.numParticles / workgroupSize);
    passEncoder.dispatchWorkgroups(workgroupCount);

    passEncoder.end();

    // Update Volumetric Glow
    this.lightGrid.update(commandEncoder, this.particleBuffer, this.numParticles, deltaTime, this.config.glowIntensity || 1.0);

    this.device.queue.submit([commandEncoder.finish()]);
  }

  render(pass, camera, lightCamera) {
    this.uniformData.fill(0);
    this.uniformData.set(camera.viewMatrix, 0); // Offset 0 (16 floats)
    this.uniformData.set(camera.projectionMatrix, 16); // Offset 16 (16 floats)

    // Calculate Shadow Matrix
    // TexCoords(0..1) = (Bias * Proj * View) * WorldPos
    const shadowMatrix = mat4.create();
    mat4.translate(shadowMatrix, shadowMatrix, [0.5, 0.5, 0.0]);
    mat4.scale(shadowMatrix, shadowMatrix, [0.5, -0.5, 1.0]);
    mat4.multiply(shadowMatrix, shadowMatrix, lightCamera.viewProjectionMatrix);
    this.uniformData.set(shadowMatrix, 32); // Offset 32 (16 floats)

    this.uniformData.set(lightCamera.position, 48); // Offset 48 (3 floats)
    this.uniformData[51] = 0.0; // isShadowPass (Offset 51, 1 float)

    // Spotlight parameters
    const lightDir = vec3.create();
    vec3.subtract(lightDir, lightCamera.target, lightCamera.position);
    vec3.normalize(lightDir, lightDir);
    this.uniformData.set(lightDir, 52); // Offset 52 (3 floats)
    this.uniformData[55] = this.config.shadowScaleBoost; // shadowScaleBoost (Offset 55, 1 float)

    // Spotlight parameters - Sync with lightCamera FOV
    const fovRad = lightCamera.fov * Math.PI / 180;
    const outerHalfAngle = fovRad * 0.5;
    const innerHalfAngle = outerHalfAngle * 0.8; // Soft edge
    this.uniformData[56] = Math.cos(innerHalfAngle); // inner angle (cos) (Offset 56, 1 float)
    this.uniformData[57] = Math.cos(outerHalfAngle); // outer angle (cos) (Offset 57, 1 float)
    this.uniformData[58] = this.config.particleScale; // particleScale (Offset 58, 1 float)
    this.uniformData[59] = this.config.maxSpeed; // maxSpeed (Offset 59, 1 float)
    this.uniformData[60] = this.config.maxRadius; // maxRadius (Offset 60, 1 float)

    this.device.queue.writeBuffer(this.uniformBuffer, 0, this.uniformData);

    pass.setPipeline(this.pipeline);
    pass.setBindGroup(0, this.bindGroup);
    pass.setVertexBuffer(0, this.quadBuffer);
    pass.setVertexBuffer(1, this.particleBuffer);
    pass.draw(6, this.numParticles);
  }

  renderShadow(pass, camera) {
    this.shadowUniformData.fill(0);
    this.shadowUniformData.set(camera.viewMatrix, 0); // Offset 0 (16 floats)
    this.shadowUniformData.set(camera.projectionMatrix, 16); // Offset 16 (16 floats)

    // lightCamera.position for shadow pass
    this.shadowUniformData.set(camera.position, 48); // Offset 48 (3 floats)
    this.shadowUniformData[51] = 1.0; // isShadowPass (Offset 51, 1 float)

    // No lightDir needed for shadow pass but filling to be safe
    this.shadowUniformData.set([0, -1, 0], 52); // Offset 52 (3 floats)
    this.shadowUniformData[55] = this.config.shadowScaleBoost; // shadowScaleBoost (Offset 55, 1 float)
    this.shadowUniformData[58] = this.config.particleScale; // particleScale (Offset 58, 1 float)
    this.shadowUniformData[59] = this.config.maxSpeed; // maxSpeed (Offset 59, 1 float)
    this.shadowUniformData[60] = this.config.maxRadius; // maxRadius (Offset 60, 1 float)

    this.device.queue.writeBuffer(this.shadowUniformBuffer, 0, this.shadowUniformData);

    pass.setViewport(0, 0, 2048, 2048, 0, 1);
    pass.setPipeline(this.shadowPipeline);
    pass.setBindGroup(0, this.shadowBindGroup);
    pass.setVertexBuffer(0, this.quadBuffer);
    pass.setVertexBuffer(1, this.particleBuffer);
    pass.draw(6, this.numParticles);
  }
}
