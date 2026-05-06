import { mat4, vec4 } from 'gl-matrix';
import { GPUUtils } from '../core/gpu_utils.js';

const shaderCode = `
struct Uniforms {
  viewProjectionMatrix : mat4x4<f32>,
}
@group(0) @binding(0) var<uniform> uniforms : Uniforms;

struct VertexOutput {
  @builtin(position) Position : vec4<f32>,
  @location(0) Color : vec4<f32>,
}

@vertex
fn vs_main(
  @location(0) position : vec3<f32>,
  @location(1) color : vec4<f32>
) -> VertexOutput {
  var output : VertexOutput;
  output.Position = uniforms.viewProjectionMatrix * vec4<f32>(position, 1.0);
  output.Color = color;
  return output;
}

@fragment
fn fs_main(@location(0) Color : vec4<f32>) -> @location(0) vec4<f32> {
  return Color;
}
`;

export class CameraHelper {
  constructor(device, format, color = [1, 0.6, 0.2, 0.8]  ) {
    this.device = device;
    this.format = format;
    this.color = color;
    this.pipeline = null;
    this.vertexBuffer = null;
    this.uniformBuffer = null;
    this.bindGroup = null;

    this.init();
  }

  init() {
    this.uniformBuffer = GPUUtils.createBuffer(this.device, {
      label: 'CameraHelper Uniform Buffer',
      size: 16 * 4,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    // 24 vertices for 12 edges
    this.vertexBuffer = this.device.createBuffer({
      label: 'CameraHelper Vertex Buffer',
      size: 24 * (3 + 4) * 4, // 24 * (pos3 + col4) * floatSize
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });

    const shaderModule = this.device.createShaderModule({
      label: 'CameraHelper Shader',
      code: shaderCode
    });

    this.pipeline = this.device.createRenderPipeline({
      label: 'CameraHelper Pipeline',
      layout: 'auto',
      vertex: {
        module: shaderModule,
        entryPoint: 'vs_main',
        buffers: [{
          arrayStride: (3 + 4) * 4,
          attributes: [
            { shaderLocation: 0, offset: 0, format: 'float32x3' }, // pos
            { shaderLocation: 1, offset: 3 * 4, format: 'float32x4' } // color
          ]
        }]
      },
      fragment: {
        module: shaderModule,
        entryPoint: 'fs_main',
        targets: [{ 
          format: this.format,
          blend: {
            color: { srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha', operation: 'add' },
            alpha: { srcFactor: 'one', dstFactor: 'one', operation: 'add' },
          }
        }]
      },
      primitive: { topology: 'line-list' },
      depthStencil: {
        depthWriteEnabled: true,
        depthCompare: 'less',
        format: 'depth24plus',
      }
    });

    this.bindGroup = this.device.createBindGroup({
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [{ binding: 0, resource: { buffer: this.uniformBuffer } }]
    });
  }

  render(pass, camera, helperCamera) {
    // 1. Calculate corners
    const invVP = mat4.create();
    mat4.invert(invVP, helperCamera.viewProjectionMatrix);

    const ndcCorners = [
      [-1,  1, 0], [ 1,  1, 0], [ 1, -1, 0], [-1, -1, 0], // Near
      [-1,  1, 1], [ 1,  1, 1], [ 1, -1, 1], [-1, -1, 1]  // Far
    ];

    const worldCorners = ndcCorners.map(c => {
      const v = vec4.fromValues(c[0], c[1], c[2], 1.0);
      vec4.transformMat4(v, v, invVP);
      return [v[0] / v[3], v[1] / v[3], v[2] / v[3]];
    });

    // 12 edges = 24 vertices
    const vertices = new Float32Array(24 * 7);
    let offset = 0;

    const addEdge = (i, j) => {
      vertices.set([...worldCorners[i], ...this.color], offset); offset += 7;
      vertices.set([...worldCorners[j], ...this.color], offset); offset += 7;
    };

    // Near plane
    addEdge(0, 1); addEdge(1, 2); addEdge(2, 3); addEdge(3, 0);
    // Far plane
    addEdge(4, 5); addEdge(5, 6); addEdge(6, 7); addEdge(7, 4);
    // Sides
    addEdge(0, 4); addEdge(1, 5); addEdge(2, 6); addEdge(3, 7);

    this.device.queue.writeBuffer(this.vertexBuffer, 0, vertices);
    this.device.queue.writeBuffer(this.uniformBuffer, 0, camera.viewProjectionMatrix);

    pass.setPipeline(this.pipeline);
    pass.setBindGroup(0, this.bindGroup);
    pass.setVertexBuffer(0, this.vertexBuffer);
    pass.draw(24);
  }
}
