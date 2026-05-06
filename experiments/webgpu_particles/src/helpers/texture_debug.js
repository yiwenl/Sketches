import debugShader from './shaders/debug_quad.wgsl?raw';

export class TextureDebug {
  constructor(device, format) {
    this.device = device;
    this.format = format;
    this.pipeline = null;
    this.sampler = null;
    this.bindGroup = null;
    this.currentTextureView = null;
    
    this.init();
  }

  init() {
    const module = this.device.createShaderModule({
      label: 'Debug Quad Shader',
      code: debugShader
    });
    
    // Explicit Bind Group Layout to force 'non-filtering' sampler
    const bindGroupLayout = this.device.createBindGroupLayout({
      label: 'Debug Quad Bind Group Layout',
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.FRAGMENT,
          texture: { sampleType: 'depth' } // depth24plus / depth32float
        },
        {
          binding: 1,
          visibility: GPUShaderStage.FRAGMENT,
          sampler: { type: 'non-filtering' }
        }
      ]
    });

    const pipelineLayout = this.device.createPipelineLayout({
      label: 'Debug Quad Pipeline Layout',
      bindGroupLayouts: [bindGroupLayout]
    });
    
    this.pipeline = this.device.createRenderPipeline({
      label: 'Debug Quad Pipeline',
      layout: pipelineLayout,
      vertex: {
        module,
        entryPoint: 'vs_main',
      },
      fragment: { 
        module, 
        entryPoint: 'fs_main',
        targets: [{ format: this.format }]
      },
      primitive: { topology: 'triangle-list' },
      depthStencil: {
        format: 'depth24plus',
        depthWriteEnabled: false,
        depthCompare: 'always',
      }
    });

    this.sampler = this.device.createSampler({
      magFilter: 'nearest',
      minFilter: 'nearest',
    });
  }

  render(pass, textureView, x, y, width, height) {
    if (this.currentTextureView !== textureView) {
      this.currentTextureView = textureView;
      this.bindGroup = this.device.createBindGroup({
        layout: this.pipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: textureView },
          { binding: 1, resource: this.sampler },
        ]
      });
    }

    pass.setViewport(x, y, width, height, 0, 1);
    pass.setPipeline(this.pipeline);
    pass.setBindGroup(0, this.bindGroup);
    pass.draw(6);
  }
}
