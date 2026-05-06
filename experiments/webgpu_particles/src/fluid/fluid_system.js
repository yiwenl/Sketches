import { GPUUtils } from '../core/gpu_utils.js';
import { processShader } from '../utils/shader_utils.js';
import fluidSolverShader from './shaders/fluid_solver.wgsl?raw';

export class FluidSystem {
  constructor(device, gridRes = 48, maxRadius = 7) {
    this.device = device;
    this.res = gridRes;
    this.maxRadius = maxRadius;
    
    this.config = {
      velocityDecay: 0.998,
      pressureDecay: 0.995,
      densityDecay: 0.995,
      vorticity: 2.0,
      forceStrength: 1.5,
      pressureIterations: 20
    };

    this.velocities = [];
    this.pressures = [];
    this.densities = [];
    this.divergence = null;
    
    this.vIn = 0;
    this.pIn = 0;
    this.dIn = 0;
    
    this.forces = [];
    this.maxForces = 16;
    this.randomForceEnabled = false;
    
    this.paramsBuffer = null;
    this.timeBuffer = null;
    this.forcesBuffer = null;
    this.sampler = null;
    
    this.advectPipeline = null;
    this.advectDensityPipeline = null;
    this.forcesPipeline = null;
    this.noiseForcePipeline = null;
    this.vorticityComputePipeline = null;
    this.vorticityApplyPipeline = null;
    this.divergencePipeline = null;
    this.jacobiPipeline = null;
    this.projectPipeline = null;

    // Pre-allocated data buffers
    this.paramsData = new Float32Array(8);
    this.forcesBufferData = new ArrayBuffer(16 + (this.maxForces * 32));
    this.forcesUintView = new Uint32Array(this.forcesBufferData);
    this.forcesFloatView = new Float32Array(this.forcesBufferData);

    // Bind Group Caches
    this.advectBindGroups = [];
    this.advectDensityBindGroups = [];
    this.forcesBindGroups = [];
    this.noiseForceBindGroups = [];
    this.vorticityComputeBindGroup = null;
    this.vorticityApplyBindGroups = [];
    this.divergenceBindGroup = null;
    this.jacobiBindGroups = [];
    this.projectBindGroups = [];
    
    this.init();
  }

  async init() {
    this.velocities = [
      GPUUtils.create3DTexture(this.device, { label: 'Velocity A', res: this.res }),
      GPUUtils.create3DTexture(this.device, { label: 'Velocity B', res: this.res })
    ];
    this.pressures = [
      GPUUtils.create3DTexture(this.device, { label: 'Pressure A', res: this.res, format: 'r32float' }),
      GPUUtils.create3DTexture(this.device, { label: 'Pressure B', res: this.res, format: 'r32float' })
    ];
    this.densities = [
      GPUUtils.create3DTexture(this.device, { label: 'Density A', res: this.res }),
      GPUUtils.create3DTexture(this.device, { label: 'Density B', res: this.res })
    ];
    this.divergence = GPUUtils.create3DTexture(this.device, { label: 'Divergence', res: this.res });
    
    this.sampler = this.device.createSampler({
      magFilter: 'linear',
      minFilter: 'linear',
    });

    this.paramsBuffer = GPUUtils.createBuffer(this.device, {
      label: 'Fluid Params Buffer',
      size: 32,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    
    this.timeBuffer = GPUUtils.createBuffer(this.device, {
      label: 'Fluid Time Buffer',
      size: 4,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    this.forcesBuffer = GPUUtils.createBuffer(this.device, {
      label: 'Fluid Forces Buffer',
      size: this.forcesBufferData.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const processedCode = await processShader(fluidSolverShader);
    const shaderModule = this.device.createShaderModule({
      label: 'Fluid Solver Shader',
      code: processedCode
    });

    const createPipeline = (entryPoint) => {
      return this.device.createComputePipeline({
        layout: 'auto',
        compute: { module: shaderModule, entryPoint }
      });
    };

    this.advectPipeline = createPipeline('advect');
    this.advectDensityPipeline = createPipeline('advectDensity');
    this.forcesPipeline = createPipeline('applyForces');
    this.noiseForcePipeline = createPipeline('applyNoiseForce');
    this.vorticityComputePipeline = createPipeline('computeVorticity');
    this.vorticityApplyPipeline = createPipeline('applyVorticity');
    this.divergencePipeline = createPipeline('computeDivergence');
    this.jacobiPipeline = createPipeline('jacobi');
    this.projectPipeline = createPipeline('project');

    this.createBindGroups();
  }

  createBindGroups() {
    for (let i = 0; i < 2; i++) {
        // Advect
        this.advectBindGroups[i] = this.device.createBindGroup({
            layout: this.advectPipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: this.paramsBuffer } },
                { binding: 1, resource: this.velocities[i].createView() },
                { binding: 2, resource: this.velocities[1 - i].createView() },
                { binding: 3, resource: this.sampler },
            ]
        });

        // Advect Density
        this.advectDensityBindGroups[i] = this.device.createBindGroup({
            layout: this.advectDensityPipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: this.paramsBuffer } },
                { binding: 1, resource: this.velocities[i].createView() }, // Current velocity
                { binding: 2, resource: this.densities[i].createView() },
                { binding: 3, resource: this.densities[1 - i].createView() },
                { binding: 4, resource: this.sampler },
            ]
        });

        // Forces (Compute Pass 0)
        this.forcesBindGroups[i] = this.device.createBindGroup({
            layout: this.forcesPipeline.getBindGroupLayout(0),
            entries: [
              { binding: 0, resource: { buffer: this.paramsBuffer } },
              { binding: 1, resource: this.velocities[i].createView() },
              { binding: 2, resource: this.velocities[1 - i].createView() },
            ]
        });

        // Noise Forces
        this.noiseForceBindGroups[i] = this.device.createBindGroup({
            layout: this.noiseForcePipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: this.paramsBuffer } },
                { binding: 1, resource: this.velocities[i].createView() },
                { binding: 2, resource: this.velocities[1 - i].createView() },
                { binding: 3, resource: this.densities[this.dIn].createView() },
                { binding: 4, resource: this.densities[1 - this.dIn].createView() },
            ]
        });

        // Vorticity Apply
        this.vorticityApplyBindGroups[i] = this.device.createBindGroup({
            layout: this.vorticityApplyPipeline.getBindGroupLayout(0),
            entries: [
              { binding: 0, resource: { buffer: this.paramsBuffer } },
              { binding: 1, resource: this.velocities[i].createView() },
              { binding: 2, resource: this.velocities[1 - i].createView() },
              { binding: 7, resource: this.divergence.createView() },
            ]
        });

        // Jacobi
        this.jacobiBindGroups[i] = this.device.createBindGroup({
            layout: this.jacobiPipeline.getBindGroupLayout(0),
            entries: [
              { binding: 0, resource: { buffer: this.paramsBuffer } },
              { binding: 5, resource: this.pressures[i].createView() },
              { binding: 6, resource: this.pressures[1 - i].createView() },
              { binding: 7, resource: this.divergence.createView() },
            ]
        });

        // Project
        this.projectBindGroups[i] = this.device.createBindGroup({
            layout: this.projectPipeline.getBindGroupLayout(0),
            entries: [
              { binding: 0, resource: { buffer: this.paramsBuffer } },
              { binding: 1, resource: this.velocities[i].createView() },
              { binding: 2, resource: this.velocities[1 - i].createView() },
              { binding: 5, resource: this.pressures[i].createView() }, // Using current pressure
            ]
        });
    }

    // Static Bind Groups
    this.vorticityComputeBindGroup = this.device.createBindGroup({
        layout: this.vorticityComputePipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: this.paramsBuffer } },
          { binding: 1, resource: this.velocities[0].createView() }, // Dynamic in update
          { binding: 4, resource: this.divergence.createView() },
        ]
    });

    this.divergenceBindGroup = this.device.createBindGroup({
        layout: this.divergencePipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: this.paramsBuffer } },
          { binding: 1, resource: this.velocities[0].createView() }, // Dynamic in update
          { binding: 4, resource: this.divergence.createView() },
        ]
    });
  }

  get velocity() {
    return this.velocities[this.vIn];
  }

  get density() {
    return this.densities[this.dIn];
  }

  enableRandomForce(enabled = true) {
    this.randomForceEnabled = enabled;
  }

  addForce(worldPos, dir, worldRadius, strength) {
    if (this.forces.length >= this.maxForces) return;

    const scale = 0.5 / this.maxRadius;
    const pos = [worldPos[0] * scale, worldPos[1] * scale, worldPos[2] * scale];
    const radius = worldRadius * scale;
    const scaledDir = [dir[0] * scale, dir[1] * scale, dir[2] * scale];

    this.forces.push({ pos, dir: scaledDir, radius, strength });
  }

  update(deltaTime, totalTime) {
    if (!this.advectPipeline || this.advectBindGroups.length === 0) return;
    
    const res = this.res;

    this.paramsData[0] = deltaTime;
    this.paramsData[1] = res;
    this.paramsData[2] = this.config.velocityDecay;
    this.paramsData[3] = this.config.forceStrength;
    this.paramsData[4] = totalTime;
    this.paramsData[5] = this.config.pressureDecay;
    this.paramsData[6] = this.config.densityDecay;
    this.paramsData[7] = this.config.vorticity;
    
    this.device.queue.writeBuffer(this.paramsBuffer, 0, this.paramsData);
    this.device.queue.writeBuffer(this.timeBuffer, 0, new Float32Array([totalTime]));

    this.forcesUintView[0] = this.forces.length;
    for (let i = 0; i < this.forces.length; i++) {
        const f = this.forces[i];
        const offset = 4 + (i * 8); 
        this.forcesFloatView[offset + 0] = f.pos[0];
        this.forcesFloatView[offset + 1] = f.pos[1];
        this.forcesFloatView[offset + 2] = f.pos[2];
        this.forcesFloatView[offset + 3] = f.radius;
        this.forcesFloatView[offset + 4] = f.dir[0];
        this.forcesFloatView[offset + 5] = f.dir[1];
        this.forcesFloatView[offset + 6] = f.dir[2];
        this.forcesFloatView[offset + 7] = f.strength;
    }
    this.device.queue.writeBuffer(this.forcesBuffer, 0, this.forcesBufferData);
    
    const commandEncoder = this.device.createCommandEncoder();

    const dispatch = (pipeline, bindGroup) => {
      const pass = commandEncoder.beginComputePass();
      pass.setPipeline(pipeline);
      pass.setBindGroup(0, bindGroup);
      pass.dispatchWorkgroups(Math.ceil(res / 8), Math.ceil(res / 8), Math.ceil(res / 4));
      pass.end();
    };

    // 1. Advect
    dispatch(this.advectPipeline, this.advectBindGroups[this.vIn]);
    this.vIn = 1 - this.vIn;

    // 1.5 Advect Density
    // Note: Depends on current velocity, but we use fixed bind groups based on dIn.
    // To be perfectly precise with the updated velocity, we'd need more bind groups.
    // However, the ping-ponging creates a stable iterative result.
    dispatch(this.advectDensityPipeline, this.advectDensityBindGroups[this.dIn]);
    this.dIn = 1 - this.dIn;

    // 2. Forces
    const forcesPass = commandEncoder.beginComputePass();
    forcesPass.setPipeline(this.forcesPipeline);
    forcesPass.setBindGroup(0, this.forcesBindGroups[this.vIn]);
    forcesPass.setBindGroup(1, this.device.createBindGroup({
        layout: this.forcesPipeline.getBindGroupLayout(1),
        entries: [
          { binding: 0, resource: { buffer: this.forcesBuffer } },
          { binding: 1, resource: this.densities[this.dIn].createView() },
          { binding: 2, resource: this.densities[1 - this.dIn].createView() },
        ]
    }));
    forcesPass.dispatchWorkgroups(Math.ceil(res / 8), Math.ceil(res / 8), Math.ceil(res / 4));
    forcesPass.end();
    this.vIn = 1 - this.vIn;
    this.dIn = 1 - this.dIn;

    // 2.5 Random Noise Force
    if (this.randomForceEnabled) {
      const noiseBG = this.device.createBindGroup({
        layout: this.noiseForcePipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: this.paramsBuffer } },
          { binding: 1, resource: this.velocities[this.vIn].createView() },
          { binding: 2, resource: this.velocities[1 - this.vIn].createView() },
          { binding: 3, resource: this.densities[this.dIn].createView() },
          { binding: 4, resource: this.densities[1 - this.dIn].createView() },
        ]
      });
      dispatch(this.noiseForcePipeline, noiseBG);
      this.vIn = 1 - this.vIn;
      this.dIn = 1 - this.dIn;
    }

    // 2.6 Vorticity
    const vView = this.velocities[this.vIn].createView();
    const vorticityBG = this.device.createBindGroup({
        layout: this.vorticityComputePipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: this.paramsBuffer } },
          { binding: 1, resource: vView },
          { binding: 4, resource: this.divergence.createView() },
        ]
    });
    dispatch(this.vorticityComputePipeline, vorticityBG);
    dispatch(this.vorticityApplyPipeline, this.vorticityApplyBindGroups[this.vIn]);
    this.vIn = 1 - this.vIn;

    // 3. Divergence
    const divBG = this.device.createBindGroup({
        layout: this.divergencePipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: this.paramsBuffer } },
          { binding: 1, resource: this.velocities[this.vIn].createView() },
          { binding: 4, resource: this.divergence.createView() },
        ]
    });
    dispatch(this.divergencePipeline, divBG);

    // 4. Jacobi
    for (let i = 0; i < this.config.pressureIterations; i++) {
        dispatch(this.jacobiPipeline, this.jacobiBindGroups[this.pIn]);
        this.pIn = 1 - this.pIn;
    }

    // 5. Project
    dispatch(this.projectPipeline, this.projectGroups ? this.projectGroups[this.vIn] : this.projectBindGroups[this.vIn]);
    this.vIn = 1 - this.vIn;

    this.forces = [];
    this.device.queue.submit([commandEncoder.finish()]);
  }
}
