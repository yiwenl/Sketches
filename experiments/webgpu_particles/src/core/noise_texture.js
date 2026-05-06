export class NoiseTexture {
  constructor(device, size = 128) {
    this.device = device;
    this.size = size;
    this.texture = null;
    this.view = null;
    this.sampler = null;

    this.init();
  }

  init() {
    this.texture = this.device.createTexture({
      size: [this.size, this.size, 1],
      format: 'rgba8unorm',
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
    });

    const data = new Uint8Array(this.size * this.size * 4);
    for (let i = 0; i < data.length; i += 4) {
      const val = Math.floor(Math.random() * 255);
      data[i] = val;     // R
      data[i + 1] = val; // G
      data[i + 2] = val; // B
      data[i + 3] = 255; // A
    }

    this.device.queue.writeTexture(
      { texture: this.texture },
      data,
      { bytesPerRow: this.size * 4 },
      [this.size, this.size, 1]
    );

    this.view = this.texture.createView();
    
    this.sampler = this.device.createSampler({
      magFilter: 'linear',
      minFilter: 'linear',
      addressModeU: 'repeat',
      addressModeV: 'repeat',
    });
  }
}
