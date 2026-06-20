import {
  BindGroup,
  Buffer,
  BufferUsage,
  Draw,
  Geom,
  Mesh,
  UniformBlock,
  type Device,
  type Texture2D,
} from "belfast";
import sliceShaderCode from "./shaders/fluidSlice";

const sliceUniforms = UniformBlock.create({
  viewProj: "mat4x4f",
  texSize: "f32",
  volumeExtent: "f32",
  showVelocity: "f32",
  showDensity: "f32",
  densityGain: "f32",
  velocityThreshold: "f32",
});

export class SlicePlane {
  readonly mesh: Mesh;

  private readonly device: Device;
  private readonly positionBuffer: Buffer;
  private readonly uvBuffer: Buffer;
  private readonly indexBuffer: Buffer;
  private readonly uniformBuffer: Buffer;
  private readonly drawPass: Draw;
  private readonly bindGroupLayout: GPUBindGroupLayout;
  private readonly pipelineLayout: GPUPipelineLayout;

  constructor(
    device: Device,
    options: {
      texSize?: number;
      volumeExtent?: number;
    } = {},
  ) {
    this.device = device;
    const texSize = options.texSize ?? 32;
    const volumeExtent = options.volumeExtent ?? 2.0;
    const geometry = Geom.plane({
      width: volumeExtent,
      height: volumeExtent,
      segmentsX: 1,
      segmentsY: 1,
    });

    this.positionBuffer = Buffer.fromData(
      device,
      geometry.positions,
      BufferUsage.vertex,
      "slice-plane-positions",
    );
    this.uvBuffer = Buffer.fromData(
      device,
      geometry.uvs,
      BufferUsage.vertex,
      "slice-plane-uvs",
    );
    this.indexBuffer = Buffer.fromData(
      device,
      geometry.indices,
      BufferUsage.index,
      "slice-plane-indices",
    );
    this.mesh = new Mesh(geometry.positions.length / 3)
      .addVertexBuffer({
        buffer: this.positionBuffer,
        arrayStride: 12,
        attributes: [{ shaderLocation: 0, format: "float32x3", offset: 0 }],
        slot: 0,
        stepMode: "vertex",
      })
      .addVertexBuffer({
        buffer: this.uvBuffer,
        arrayStride: 8,
        attributes: [{ shaderLocation: 1, format: "float32x2", offset: 0 }],
        slot: 1,
        stepMode: "vertex",
      })
      .setIndexBuffer(
        this.indexBuffer,
        geometry.indices.length,
        geometry.indices instanceof Uint32Array ? "uint32" : "uint16",
      );

    this.uniformBuffer = Buffer.create(
      device,
      Buffer.uniformSize(sliceUniforms.byteSize),
      BufferUsage.uniform,
      "slice-plane-uniforms",
    );

    const stage = GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT;
    this.bindGroupLayout = device.gpu.createBindGroupLayout({
      label: "SlicePlaneBindGroupLayout",
      entries: [
        { binding: 0, visibility: stage, buffer: { type: "uniform" } },
        {
          binding: 1,
          visibility: stage,
          texture: { sampleType: "unfilterable-float", viewDimension: "2d" },
        },
        {
          binding: 2,
          visibility: stage,
          texture: { sampleType: "unfilterable-float", viewDimension: "2d" },
        },
      ],
    });

    this.pipelineLayout = device.gpu.createPipelineLayout({
      label: "SlicePlanePipelineLayout",
      bindGroupLayouts: [this.bindGroupLayout],
    });

    this.drawPass = new Draw(device, sliceShaderCode, {
      label: "SlicePlane",
      layout: this.pipelineLayout,
      vertexBuffers: this.mesh.getVertexLayouts(),
      primitive: { topology: "triangle-list", cullMode: "none" },
      depthStencil: {
        format: "depth24plus",
        depthWriteEnabled: false,
        depthCompare: "less",
      },
      targets: [
        {
          format: device.format,
          blend: {
            color: {
              srcFactor: "src-alpha",
              dstFactor: "one-minus-src-alpha",
              operation: "add",
            },
            alpha: {
              srcFactor: "one",
              dstFactor: "one-minus-src-alpha",
              operation: "add",
            },
          },
        },
      ],
    });

    sliceUniforms
      .set("viewProj", new Float32Array(16))
      .set("texSize", texSize)
      .set("volumeExtent", volumeExtent)
      .set("showVelocity", 1)
      .set("showDensity", 1)
      .set("densityGain", 14)
      .set("velocityThreshold", 1.2)
      .writeToBuffer(this.uniformBuffer, device);
  }

  draw(
    pass: GPURenderPassEncoder,
    velocity: Texture2D,
    density: Texture2D,
    viewProj: Float32Array | number[],
    options: {
      showVelocity: boolean;
      showDensity: boolean;
      densityGain: number;
      velocityThreshold: number;
    },
  ): void {
    sliceUniforms
      .set("viewProj", viewProj)
      .set("showVelocity", options.showVelocity ? 1 : 0)
      .set("showDensity", options.showDensity ? 1 : 0)
      .set("densityGain", options.densityGain)
      .set("velocityThreshold", options.velocityThreshold)
      .writeToBuffer(this.uniformBuffer, this.device);

    const bindGroup = BindGroup.create(
      this.device,
      this.bindGroupLayout,
      [
        { binding: 0, resource: this.uniformBuffer },
        { binding: 1, resource: velocity.view },
        { binding: 2, resource: density.view },
      ],
      "slice-plane-bind-group",
    );

    this.drawPass.draw(pass, this.mesh, bindGroup);
  }

  destroy(): void {
    this.positionBuffer.destroy();
    this.uvBuffer.destroy();
    this.indexBuffer.destroy();
    this.uniformBuffer.destroy();
  }
}
