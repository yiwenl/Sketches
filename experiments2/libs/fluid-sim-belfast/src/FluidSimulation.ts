import {
  BindGroup,
  Buffer,
  BufferUsage,
  Compute,
  Texture3D,
  Texture3DPingPong,
  UniformBlock,
  type Device,
} from "belfast";
import defaultSettings, { type FluidSettings } from "./defaultSettings";
import advectShader from "./shaders/advect";
import applyForcesShader from "./shaders/applyForces";
import divergenceShader from "./shaders/divergence";
import jacobiShader from "./shaders/jacobi";
import gradientSubtractShader from "./shaders/gradientSubtract";
import clearShader from "./shaders/clear";
import vorticityConfinementShader from "./shaders/vorticityConfinement";

const WORKGROUP_SIZE = 4;

/** World half-extent of the sim cube (world coords in [-maxRadius, maxRadius]). */
const DEFAULT_MAX_RADIUS = 1.0;

function randomUnitVec3(): [number, number, number] {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  return [
    Math.sin(phi) * Math.cos(theta),
    Math.sin(phi) * Math.sin(theta),
    Math.cos(phi),
  ];
}

const passUniforms = UniformBlock.create({
  gridSize: "f32",
  dissipation: "f32",
  timestep: "f32",
  _pad: "f32",
});

const gridUniforms = UniformBlock.create({
  gridSize: "f32",
  _pad0: "f32",
  _pad1: "f32",
  _pad2: "f32",
});

const clearUniforms = UniformBlock.create({
  gridSize: "f32",
  dissipation: "f32",
  _pad0: "f32",
  _pad1: "f32",
});

const forceUniforms = UniformBlock.create({
  gridSize: "f32",
  dt: "f32",
  strength: "f32",
  radius: "f32",
  center: "vec3f",
  dir: "vec3f",
});

const vorticityUniforms = UniformBlock.create({
  gridSize: "f32",
  dt: "f32",
  curl: "f32",
  _pad: "f32",
});

export type RandomForceOptions = {
  strengthMin?: number;
  strengthMax?: number;
  radiusMin?: number;
  radiusMax?: number;
};

type PendingForce = {
  center: [number, number, number];
  dir: [number, number, number];
  radius: number;
  strength: number;
};

export default class FluidSimulation {
  readonly settings: FluidSettings;
  readonly maxRadius: number;

  private readonly _device: Device;
  private readonly _gridSize: number;
  private readonly _dispatch: [number, number, number];
  private _dt = 1 / 60;

  private readonly _velocity: Texture3DPingPong;
  private readonly _density: Texture3DPingPong;
  private readonly _pressure: Texture3DPingPong;
  private readonly _divergenceTex: Texture3D;

  private readonly _passUniformBuffer: Buffer;
  private readonly _gridUniformBuffer: Buffer;
  private readonly _clearUniformBuffer: Buffer;
  private readonly _vorticityUniformBuffer: Buffer;
  private readonly _forceUniformBuffer: Buffer;

  private readonly _advect: Compute;
  private readonly _applyForces: Compute;
  private readonly _vorticityConfinement: Compute;
  private readonly _divergenceCompute: Compute;
  private readonly _jacobi: Compute;
  private readonly _gradient: Compute;
  private readonly _clear: Compute;

  private readonly _pendingForces: PendingForce[] = [];

  constructor(
    device: Device,
    mSettings: Partial<FluidSettings> = {},
    maxRadius = DEFAULT_MAX_RADIUS,
  ) {
    this._device = device;
    this.maxRadius = maxRadius;
    this.settings = { ...defaultSettings };
    for (const key in mSettings) {
      const k = key as keyof FluidSettings;
      if (this.settings[k] !== undefined && mSettings[k] !== undefined) {
        (this.settings as FluidSettings)[k] = mSettings[k] as never;
      }
    }

    const size = this.settings.TEXTURE_SIZE;
    this._gridSize = size;
    this._dispatch = [size / WORKGROUP_SIZE, size / WORKGROUP_SIZE, size / WORKGROUP_SIZE];

    this._velocity = Texture3DPingPong.create(device, size, { label: "Velocity" });
    this._density = Texture3DPingPong.create(device, size, { label: "Density" });
    this._pressure = Texture3DPingPong.create(device, size, { label: "Pressure" });
    this._divergenceTex = Texture3D.create(device, size, { label: "Divergence" });

    const uniformUsage = BufferUsage.uniform;
    this._passUniformBuffer = Buffer.create(
      device,
      Buffer.uniformSize(passUniforms.byteSize),
      uniformUsage,
      "fluid-pass-uniforms",
    );
    this._gridUniformBuffer = Buffer.create(
      device,
      Buffer.uniformSize(gridUniforms.byteSize),
      uniformUsage,
      "fluid-grid-uniforms",
    );
    this._clearUniformBuffer = Buffer.create(
      device,
      Buffer.uniformSize(clearUniforms.byteSize),
      uniformUsage,
      "fluid-clear-uniforms",
    );
    this._forceUniformBuffer = Buffer.create(
      device,
      Buffer.uniformSize(forceUniforms.byteSize),
      uniformUsage,
      "fluid-force-uniforms",
    );
    this._vorticityUniformBuffer = Buffer.create(
      device,
      Buffer.uniformSize(vorticityUniforms.byteSize),
      uniformUsage,
      "fluid-vorticity-uniforms",
    );

    this._advect = new Compute(device, advectShader, { label: "FluidAdvect" });
    this._applyForces = new Compute(device, applyForcesShader, { label: "FluidApplyForces" });
    this._vorticityConfinement = new Compute(device, vorticityConfinementShader, { label: "FluidVorticityConfinement" });
    this._divergenceCompute = new Compute(device, divergenceShader, { label: "FluidDivergence" });
    this._jacobi = new Compute(device, jacobiShader, { label: "FluidJacobi" });
    this._gradient = new Compute(device, gradientSubtractShader, { label: "FluidGradient" });
    this._clear = new Compute(device, clearShader, { label: "FluidClear" });
  }

  /**
   * Add a force in **world space** (+Y is up), matching webgpu_particles `addForce`.
   */
  addForce(
    worldPos: [number, number, number],
    dir: [number, number, number],
    worldRadius: number,
    strength: number,
  ): void {
    const scale = 0.5 / this.maxRadius;
    this._pendingForces.push({
      center: [
        worldPos[0] * scale,
        worldPos[1] * scale,
        worldPos[2] * scale,
      ],
      dir: [dir[0] * scale, dir[1] * scale, dir[2] * scale],
      radius: worldRadius * scale,
      strength,
    });
  }

  /** Legacy API — `mPos` in normalized [0,1]³ texture space. */
  updateFlow(
    mPos: [number, number, number],
    mDir: [number, number, number],
    mStrength = 1,
    mRadius = 1,
    _mNoiseStrength = 0,
  ): void {
    const worldPos: [number, number, number] = [
      (mPos[0] - 0.5) * 2 * this.maxRadius,
      (mPos[1] - 0.5) * 2 * this.maxRadius,
      (mPos[2] - 0.5) * 2 * this.maxRadius,
    ];
    const worldRadius = 0.08 * mRadius * this.maxRadius;
    this.addForce(worldPos, mDir, worldRadius, 800 * mStrength);
  }

  applyRandomForces(count: number, options: RandomForceOptions = {}): void {
    const {
      strengthMin = 400,
      strengthMax = 1200,
      radiusMin = 0.06,
      radiusMax = 0.14,
    } = options;

    for (let i = 0; i < count; i++) {
      const worldPos: [number, number, number] = [
        (Math.random() - 0.5) * 2 * this.maxRadius,
        (Math.random() - 0.5) * 2 * this.maxRadius,
        (Math.random() - 0.5) * 2 * this.maxRadius,
      ];
      const strength = strengthMin + Math.random() * (strengthMax - strengthMin);
      const radius = radiusMin + Math.random() * (radiusMax - radiusMin);
      this.addForce(worldPos, randomUnitVec3(), radius * this.maxRadius, strength);
    }
  }

  updateFlowWithMap(
    _mTextureVel: Texture3D,
    _mTextureDensity: Texture3D,
    _uStrength = 1,
  ): void {
    // Stub — not required for the fluid-sim-3d demo.
  }

  update(encoder: GPUCommandEncoder, deltaTime?: number): void {
    if (deltaTime !== undefined) {
      this._dt = Math.min(deltaTime, 0.1);
    }

    const pass = encoder.beginComputePass({ label: "fluid-sim" });

    // 1. Advect (webgpu_particles order: advect before forces)
    this._advectPass(pass, this._velocity, this.settings.VELOCITY_DISSIPATION);
    this._advectPass(pass, this._density, this.settings.DENSITY_DISSIPATION);

    // 2. Apply queued forces
    this._flushForces(pass);

    // 3. Vorticity confinement — re-inject curl to fight numerical dissipation
    if (this.settings.CURL > 0) {
      this._vorticityConfinementPass(pass);
    }

    // 4. Pressure solve
    this._divergencePass(pass);
    this._clearPass(pass);
    for (let i = 0; i < this.settings.PRESSURE_ITERATIONS; i++) {
      this._jacobiPass(pass);
    }
    this._gradientPass(pass);


    pass.end();
  }

  get velocity(): Texture3D {
    return this._velocity.read;
  }

  get density(): Texture3D {
    return this._density.read;
  }

  get divergence(): Texture3D {
    return this._divergenceTex;
  }

  get pressure(): Texture3D {
    return this._pressure.read;
  }

  get allTextures(): Texture3D[] {
    return [this.velocity, this.density, this._divergenceTex, this.pressure];
  }

  log(): void {
    console.log("Fluid Settings : ");
    for (const key in this.settings) {
      console.log(key, this.settings[key as keyof FluidSettings]);
    }
  }

  destroy(): void {
    this._velocity.destroy();
    this._density.destroy();
    this._pressure.destroy();
    this._divergenceTex.destroy();
    this._passUniformBuffer.destroy();
    this._gridUniformBuffer.destroy();
    this._clearUniformBuffer.destroy();
    this._forceUniformBuffer.destroy();
    this._vorticityUniformBuffer.destroy();
  }

  private _writePassUniforms(dissipation: number): void {
    passUniforms
      .set("gridSize", this._gridSize)
      .set("dissipation", dissipation)
      .set("timestep", this._dt)
      .set("_pad", 0)
      .writeToBuffer(this._passUniformBuffer, this._device);
  }

  private _writeGridUniforms(): void {
    gridUniforms
      .set("gridSize", this._gridSize)
      .set("_pad0", 0)
      .set("_pad1", 0)
      .set("_pad2", 0)
      .writeToBuffer(this._gridUniformBuffer, this._device);
  }

  private _advectPass(
    pass: GPUComputePassEncoder,
    pingPong: Texture3DPingPong,
    dissipation: number,
  ): void {
    this._writePassUniforms(dissipation);
    const bindGroup = BindGroup.create(
      this._device,
      this._advect.getBindGroupLayout(0),
      [
        { binding: 0, resource: this._passUniformBuffer },
        { binding: 1, resource: this._velocity.read.view },
        { binding: 2, resource: pingPong.read.view },
        { binding: 3, resource: pingPong.write.storageView },
      ],
      "fluid-advect-bg",
    );
    this._advect.dispatch(pass, bindGroup, this._dispatch);
    pingPong.swap();
  }

  private _vorticityConfinementPass(pass: GPUComputePassEncoder): void {
    vorticityUniforms
      .set("gridSize", this._gridSize)
      .set("dt", this._dt)
      .set("curl", this.settings.CURL)
      .set("_pad", 0)
      .writeToBuffer(this._vorticityUniformBuffer, this._device);

    const bindGroup = BindGroup.create(
      this._device,
      this._vorticityConfinement.getBindGroupLayout(0),
      [
        { binding: 0, resource: this._vorticityUniformBuffer },
        { binding: 1, resource: this._velocity.read.view },
        { binding: 2, resource: this._velocity.write.storageView },
      ],
      "fluid-vorticity-bg",
    );
    this._vorticityConfinement.dispatch(pass, bindGroup, this._dispatch);
    this._velocity.swap();
  }

  private _flushForces(pass: GPUComputePassEncoder): void {
    for (const force of this._pendingForces) {
      forceUniforms
        .set("gridSize", this._gridSize)
        .set("dt", this._dt)
        .set("strength", force.strength)
        .set("radius", force.radius)
        .set("center", force.center)
        .set("dir", force.dir)
        .writeToBuffer(this._forceUniformBuffer, this._device);

      const bindGroup = BindGroup.create(
        this._device,
        this._applyForces.getBindGroupLayout(0),
        [
          { binding: 0, resource: this._forceUniformBuffer },
          { binding: 1, resource: this._velocity.read.view },
          { binding: 2, resource: this._density.read.view },
          { binding: 3, resource: this._velocity.write.storageView },
          { binding: 4, resource: this._density.write.storageView },
        ],
        "fluid-apply-forces-bg",
      );
      this._applyForces.dispatch(pass, bindGroup, this._dispatch);
      this._velocity.swap();
      this._density.swap();
    }
    this._pendingForces.length = 0;
  }

  private _divergencePass(pass: GPUComputePassEncoder): void {
    this._writeGridUniforms();
    const bindGroup = BindGroup.create(
      this._device,
      this._divergenceCompute.getBindGroupLayout(0),
      [
        { binding: 0, resource: this._gridUniformBuffer },
        { binding: 1, resource: this._velocity.read.view },
        { binding: 2, resource: this._divergenceTex.storageView },
      ],
      "fluid-divergence-bg",
    );
    this._divergenceCompute.dispatch(pass, bindGroup, this._dispatch);
  }

  private _clearPass(pass: GPUComputePassEncoder): void {
    clearUniforms
      .set("gridSize", this._gridSize)
      .set("dissipation", this.settings.PRESSURE_DISSIPATION)
      .set("_pad0", 0)
      .set("_pad1", 0)
      .writeToBuffer(this._clearUniformBuffer, this._device);

    const bindGroup = BindGroup.create(
      this._device,
      this._clear.getBindGroupLayout(0),
      [
        { binding: 0, resource: this._clearUniformBuffer },
        { binding: 1, resource: this._pressure.read.view },
        { binding: 2, resource: this._pressure.write.storageView },
      ],
      "fluid-clear-bg",
    );
    this._clear.dispatch(pass, bindGroup, this._dispatch);
    this._pressure.swap();
  }

  private _jacobiPass(pass: GPUComputePassEncoder): void {
    this._writeGridUniforms();
    const bindGroup = BindGroup.create(
      this._device,
      this._jacobi.getBindGroupLayout(0),
      [
        { binding: 0, resource: this._gridUniformBuffer },
        { binding: 1, resource: this._pressure.read.view },
        { binding: 2, resource: this._divergenceTex.view },
        { binding: 3, resource: this._pressure.write.storageView },
      ],
      "fluid-jacobi-bg",
    );
    this._jacobi.dispatch(pass, bindGroup, this._dispatch);
    this._pressure.swap();
  }

  private _gradientPass(pass: GPUComputePassEncoder): void {
    this._writeGridUniforms();
    const bindGroup = BindGroup.create(
      this._device,
      this._gradient.getBindGroupLayout(0),
      [
        { binding: 0, resource: this._gridUniformBuffer },
        { binding: 1, resource: this._pressure.read.view },
        { binding: 2, resource: this._velocity.read.view },
        { binding: 3, resource: this._velocity.write.storageView },
      ],
      "fluid-gradient-bg",
    );
    this._gradient.dispatch(pass, bindGroup, this._dispatch);
    this._velocity.swap();
  }
}
