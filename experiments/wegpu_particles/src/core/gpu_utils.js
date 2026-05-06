export class GPUUtils {
  static createBuffer(device, { label, size, usage, data }) {
    const bufferSize = data ? data.byteLength : size;
    const alignedSize = Math.max(1, (bufferSize + 3) & ~3); // 4-byte alignment

    const buffer = device.createBuffer({
      label,
      size: alignedSize,
      usage,
    });

    if (data) {
      device.queue.writeBuffer(buffer, 0, data);
    }

    return buffer;
  }

  static createTexture(device, { label, size, format = 'rgba8unorm', usage, dimension = '2d', sampleCount = 1 }) {
    return device.createTexture({
      label,
      size: size.length === 2 ? [size[0], size[1], 1] : size,
      dimension,
      format,
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.STORAGE_BINDING | usage,
      sampleCount
    });
  }

  static create3DTexture(device, { label, res, format = 'rgba16float', usage }) {
    return device.createTexture({
      label,
      size: [res, res, res],
      dimension: '3d',
      format,
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.STORAGE_BINDING | usage,
    });
  }

  static async createTextureFromImage(device, url) {
    const response = await fetch(url);
    const blob = await response.blob();
    const source = await createImageBitmap(blob);

    const texture = device.createTexture({
      label: `Texture: ${url}`,
      size: [source.width, source.height, 1],
      format: 'rgba8unorm',
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
    });

    device.queue.copyExternalImageToTexture(
      { source },
      { texture },
      [source.width, source.height]
    );

    return texture;
  }
}
