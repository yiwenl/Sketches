import { mat4, vec3 } from 'gl-matrix';
import { GPUUtils } from '../core/gpu_utils.js';

const shaderCode = `
struct Uniforms {
  viewProjectionMatrix : mat4x4<f32>,
  modelMatrix : mat4x4<f32>,
  color : vec4<f32>,
}
@group(0) @binding(0) var<uniform> uniforms : Uniforms;

struct VertexOutput {
  @builtin(position) Position : vec4<f32>,
  @location(0) Color : vec4<f32>,
}

@vertex
fn vs_main(@location(0) position : vec3<f32>) -> VertexOutput {
  var output : VertexOutput;
  output.Position = uniforms.viewProjectionMatrix * uniforms.modelMatrix * vec4<f32>(position, 1.0);
  output.Color = uniforms.color;
  return output;
}

@fragment
fn fs_main(@location(0) Color : vec4<f32>) -> @location(0) vec4<f32> {
  return Color;
}
`;

export class SphereHelper {
  constructor(device, format) {
    this.device = device;
    this.format = format;
    this.pipeline = null;
    this.vertexBuffer = null;
    this.indexBuffer = null;
    this.uniformBuffer = null;
    this.bindGroup = null;
    this.indexCount = 0;

    this.init();
  }

  init() {
    // Generate Sphere Geometry
    const latitudeBands = 16;
    const longitudeBands = 16;
    const radius = 1.0;

    const vertices = [];
    for (let lat = 0; lat <= latitudeBands; lat++) {
      const theta = (lat * Math.PI) / latitudeBands;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);

      for (let lon = 0; lon <= longitudeBands; lon++) {
        const phi = (lon * 2 * Math.PI) / longitudeBands;
        const x = Math.cos(phi) * sinTheta;
        const y = cosTheta;
        const z = Math.sin(phi) * sinTheta;

        vertices.push(x * radius, y * radius, z * radius);
      }
    }

    const indices = [];
    for (let lat = 0; lat < latitudeBands; lat++) {
      for (let lon = 0; lon < longitudeBands; lon++) {
        const first = lat * (longitudeBands + 1) + lon;
        const second = first + longitudeBands + 1;

        indices.push(first, second, first + 1);
        indices.push(second, second + 1, first + 1);
      }
    }
    this.indexCount = indices.length;

    this.vertexBuffer = GPUUtils.createBuffer(this.device, {
      label: 'Sphere Vertex Buffer',
      data: new Float32Array(vertices),
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });

    this.indexBuffer = GPUUtils.createBuffer(this.device, {
      label: 'Sphere Index Buffer',
      data: new Uint16Array(indices),
      usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
    });

    this.uniformBuffer = GPUUtils.createBuffer(this.device, {
      label: 'Sphere Uniform Buffer',
      size: 16 * 4 * 2 + 16, // ViewProj, Model, Color
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const shaderModule = this.device.createShaderModule({
      label: 'Sphere Shader',
      code: shaderCode
    });

    this.pipeline = this.device.createRenderPipeline({
      label: 'Sphere Pipeline',
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
            alpha: { srcFactor: 'one', dstFactor: 'one', operation: 'add' },
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
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [{ binding: 0, resource: { buffer: this.uniformBuffer } }]
    });
  }

  render(pass, camera, position, radius = 0.5, color = [1, 1, 1, 1]) {
    const modelMatrix = mat4.create();
    mat4.translate(modelMatrix, modelMatrix, position);
    mat4.scale(modelMatrix, modelMatrix, [radius, radius, radius]);

    this.device.queue.writeBuffer(this.uniformBuffer, 0, camera.viewProjectionMatrix);
    this.device.queue.writeBuffer(this.uniformBuffer, 64, modelMatrix);
    this.device.queue.writeBuffer(this.uniformBuffer, 128, new Float32Array(color));

    pass.setPipeline(this.pipeline);
    pass.setBindGroup(0, this.bindGroup);
    pass.setVertexBuffer(0, this.vertexBuffer);
    pass.setIndexBuffer(this.indexBuffer, 'uint16');
    pass.drawIndexed(this.indexCount);
  }
}
