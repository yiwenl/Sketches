import {
  BindGroup,
  Buffer,
  BufferUsage,
  Draw,
  Mesh,
  UniformBlock,
  type Device,
  type Texture3D,
} from "belfast";
import arrowsShaderCode from "./shaders/arrows-draw.wgsl?raw";

const sceneUniforms = UniformBlock.create({
  viewProj: "mat4x4f",
  lengthScale: "f32",
  visGrid: "f32",
  texSize: "f32",
  volumeExtent: "f32",
});

export class ArrowField {
  readonly instanceCount: number;
  readonly mesh: Mesh;

  private readonly device: Device;
  private readonly segmentBuffer: Buffer;
  private readonly sceneUniformBuffer: Buffer;
  private readonly lineDraw: Draw;
  private readonly bindGroupLayout: GPUBindGroupLayout;
  private readonly pipelineLayout: GPUPipelineLayout;

  constructor(
    device: Device,
    options: {
      visGrid?: number;
      texSize?: number;
      volumeExtent?: number;
      lengthScale?: number;
    } = {},
  ) {
    this.device = device;
    const visGrid = options.visGrid ?? 16;
    const texSize = options.texSize ?? 32;
    const volumeExtent = options.volumeExtent ?? 2.0;
    const lengthScale = options.lengthScale ?? 0.35;

    this.instanceCount = visGrid * visGrid * visGrid;

    const segmentPositions = new Float32Array([0, 0, 0, 0, 1, 0]);
    this.segmentBuffer = Buffer.fromData(
      device,
      segmentPositions,
      BufferUsage.vertex,
      "arrow-segment",
    );

    this.mesh = new Mesh(2).addVertexBuffer({
      buffer: this.segmentBuffer,
      arrayStride: 12,
      attributes: [{ shaderLocation: 0, format: "float32x3", offset: 0 }],
      slot: 0,
      stepMode: "vertex",
    });

    this.sceneUniformBuffer = Buffer.create(
      device,
      Buffer.uniformSize(sceneUniforms.byteSize),
      BufferUsage.uniform,
      "arrow-scene-uniforms",
    );

    const stage = GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT;
    this.bindGroupLayout = device.gpu.createBindGroupLayout({
      label: "ArrowFieldBindGroupLayout",
      entries: [
        { binding: 0, visibility: stage, buffer: { type: "uniform" } },
        {
          binding: 1,
          visibility: stage,
          texture: { sampleType: "unfilterable-float", viewDimension: "3d" },
        },
        {
          binding: 2,
          visibility: stage,
          texture: { sampleType: "unfilterable-float", viewDimension: "3d" },
        },
      ],
    });

    this.pipelineLayout = device.gpu.createPipelineLayout({
      label: "ArrowFieldPipelineLayout",
      bindGroupLayouts: [this.bindGroupLayout],
    });

    this.lineDraw = new Draw(device, arrowsShaderCode, {
      label: "ArrowField",
      layout: this.pipelineLayout,
      vertexBuffers: this.mesh.getVertexLayouts(),
      primitive: { topology: "line-list", cullMode: "none" },
      depthStencil: {
        format: "depth24plus",
        depthWriteEnabled: true,
        depthCompare: "less",
      },
    });

    sceneUniforms
      .set("viewProj", new Float32Array(16))
      .set("lengthScale", lengthScale)
      .set("visGrid", visGrid)
      .set("texSize", texSize)
      .set("volumeExtent", volumeExtent)
      .writeToBuffer(this.sceneUniformBuffer, device);
  }

  setViewProjection(viewProj: Float32Array | number[]): void {
    sceneUniforms.set("viewProj", viewProj).writeToBuffer(this.sceneUniformBuffer, this.device);
  }

  setLengthScale(scale: number): void {
    sceneUniforms.set("lengthScale", scale).writeToBuffer(this.sceneUniformBuffer, this.device);
  }

  draw(
    pass: GPURenderPassEncoder,
    velocity: Texture3D,
    density: Texture3D,
    viewProj: Float32Array | number[],
  ): void {
    sceneUniforms.set("viewProj", viewProj).writeToBuffer(this.sceneUniformBuffer, this.device);

    const bindGroup = BindGroup.create(
      this.device,
      this.bindGroupLayout,
      [
        { binding: 0, resource: this.sceneUniformBuffer },
        { binding: 1, resource: velocity.view },
        { binding: 2, resource: density.view },
      ],
      "arrow-field-bind-group",
    );

    this.lineDraw.draw(pass, this.mesh, bindGroup, this.instanceCount);
  }

  destroy(): void {
    this.segmentBuffer.destroy();
    this.sceneUniformBuffer.destroy();
  }
}
