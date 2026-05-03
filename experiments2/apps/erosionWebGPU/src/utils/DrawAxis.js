import { mat4 } from "gl-matrix";
import WebGPUContext from "../WebGPUContext";
import vs from "../shaders/axis.vert.wgsl?raw";
import fs from "../shaders/axis.frag.wgsl?raw";

class DrawAxis {
  constructor() {
    const { device, format } = WebGPUContext;

    // Create vertex data
    // Each vertex: pos(3), color(3)
    const vertices = new Float32Array([
      // X axis (Red)
      -100, 0, 0, 1, 0, 0, 100, 0, 0, 1, 0, 0,
      // Y axis (Green)
      0, -100, 0, 0, 1, 0, 0, 100, 0, 0, 1, 0,
      // Z axis (Blue)
      0, 0, -100, 0, 0, 1, 0, 0, 100, 0, 0, 1,
    ]);

    this.vertexBuffer = device.createBuffer({
      size: vertices.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true,
    });
    new Float32Array(this.vertexBuffer.getMappedRange()).set(vertices);
    this.vertexBuffer.unmap();

    // Uniform buffer
    this.uniformBuffer = device.createBuffer({
      size: 64, // mat4x4
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    // Pipeline
    this.pipeline = device.createRenderPipeline({
      layout: "auto",
      vertex: {
        module: device.createShaderModule({ code: vs }),
        entryPoint: "main",
        buffers: [
          {
            arrayStride: 24, // 6 floats * 4 bytes
            attributes: [
              { shaderLocation: 0, offset: 0, format: "float32x3" }, // pos
              { shaderLocation: 1, offset: 12, format: "float32x3" }, // color
            ],
          },
        ],
      },
      fragment: {
        module: device.createShaderModule({ code: fs }),
        entryPoint: "main",
        targets: [{ format }],
      },
      primitive: {
        topology: "line-list",
      },
      depthStencil: {
        depthWriteEnabled: true,
        depthCompare: "less",
        format: "depth24plus",
      },
    });

    this.bindGroup = device.createBindGroup({
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [
        {
          binding: 0,
          resource: { buffer: this.uniformBuffer },
        },
      ],
    });

    this.viewProjectionMatrix = mat4.create();
  }

  draw(passEncoder, camera) {
    const { device } = WebGPUContext;

    // Update uniform buffer
    mat4.multiply(
      this.viewProjectionMatrix,
      camera.projectionMatrix,
      camera.viewMatrix,
    );
    device.queue.writeBuffer(this.uniformBuffer, 0, this.viewProjectionMatrix);

    passEncoder.setPipeline(this.pipeline);
    passEncoder.setBindGroup(0, this.bindGroup);
    passEncoder.setVertexBuffer(0, this.vertexBuffer);
    passEncoder.draw(6); // 2 vertices per axis * 3 axes
  }
}

export default DrawAxis;
