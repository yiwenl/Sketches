import floorShader from './shaders/floor.wgsl?raw';
import { GPUUtils } from '../core/gpu_utils.js';
import { mat4, vec3 } from 'gl-matrix';
import { Constants } from '../constants.js';
import { Config } from '../config.js';

export class Floor {
  constructor(device, format, shadowDepthTexture) {
    this.device = device;
    this.format = format;
    this.shadowDepthTexture = shadowDepthTexture;
    
    this.pipeline = null;
    this.vertexBuffer = null;
    this.uniformBuffer = null;
    this.bindGroup = null;
    this.shadowSampler = null;
    this.glowTexture = null;
    this.glowSampler = null;
    this.lightIntensity = Config.floorLightIntensity;

    this.init();
  }

  init() {
    // 1. Geometry - Large Quad on XZ plane
    const size = 50;
    const y = Constants.floorY; 
    const vertices = new Float32Array([
      -size, y, -size,
       size, y, -size,
      -size, y,  size,
      -size, y,  size,
       size, y, -size,
       size, y,  size,
    ]);

    this.vertexBuffer = GPUUtils.createBuffer(this.device, {
      label: 'Floor Vertex Buffer',
      data: vertices,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    });

    // 2. Uniforms (view64, proj64, shadow64, pos16, dir16, spot16) = 240 -> padded to 256
    this.uniformBuffer = GPUUtils.createBuffer(this.device, {
      label: 'Floor Uniform Buffer',
      size: 256, 
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });
    this.uniformData = new Float32Array(256 / 4);

    this.shadowSampler = this.device.createSampler({
      compare: 'less',
      magFilter: 'linear',
      minFilter: 'linear',
      addressModeU: 'clamp-to-edge',
      addressModeV: 'clamp-to-edge',
    });

    const shaderModule = this.device.createShaderModule({
      label: 'Floor Shader Module',
      code: floorShader
    });

    this.pipeline = this.device.createRenderPipeline({
      label: 'Floor Pipeline',
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
        depthWriteEnabled: false,
        depthCompare: 'less',
        format: 'depth24plus',
      }
    });

  }
  
  updateBindGroup(glowTexture, glowSampler) {
    this.glowTexture = glowTexture;
    this.glowSampler = glowSampler;

    this.bindGroup = this.device.createBindGroup({
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.uniformBuffer } },
        { binding: 1, resource: this.shadowDepthTexture.createView() },
        { binding: 2, resource: this.shadowSampler },
        { binding: 3, resource: this.glowTexture.createView({ dimension: '3d' }) },
        { binding: 4, resource: this.glowSampler }
      ]
    });
  }

  render(pass, camera, lightCamera, maxRadius) {
    if (!this.bindGroup) return;
    // 0: viewProj (16 floats)
    this.uniformData.set(camera.viewProjectionMatrix, 0);

    // 16: shadowMatrix (16 floats)
    const shadowMatrix = mat4.create();
    mat4.translate(shadowMatrix, shadowMatrix, [0.5, 0.5, 0.0]);    
    mat4.scale(shadowMatrix, shadowMatrix, [0.5, -0.5, 1.0]); 
    mat4.multiply(shadowMatrix, shadowMatrix, lightCamera.viewProjectionMatrix);
    this.uniformData.set(shadowMatrix, 16);

    // 32: lightPos (4 floats with pad)
    this.uniformData.set(lightCamera.position, 32);
    
    // 36: lightDir (4 floats with pad)
    const lightDir = vec3.create();
    vec3.subtract(lightDir, lightCamera.target, lightCamera.position);
    vec3.normalize(lightDir, lightDir);
    this.uniformData.set(lightDir, 36);

    // 40: spotParams (4 floats with pad)
    const fovRad = lightCamera.fov * Math.PI / 180;
    const outerHalfAngle = fovRad * 0.5;
    const innerHalfAngle = outerHalfAngle * 0.8;
    this.uniformData[40] = Math.cos(innerHalfAngle);
    this.uniformData[41] = Math.cos(outerHalfAngle);
    this.uniformData[42] = camera.aspect;
    this.uniformData[43] = this.lightIntensity;
    this.uniformData[44] = this.device.canvas?.width || window.innerWidth;
    this.uniformData[45] = this.device.canvas?.height || window.innerHeight;
    this.uniformData[46] = maxRadius;

    this.device.queue.writeBuffer(this.uniformBuffer, 0, this.uniformData);

    pass.setPipeline(this.pipeline);
    pass.setBindGroup(0, this.bindGroup);
    pass.setVertexBuffer(0, this.vertexBuffer);
    pass.draw(6);
  }
}
