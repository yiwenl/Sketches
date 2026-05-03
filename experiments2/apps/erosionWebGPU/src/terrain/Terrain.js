import WebGPUContext from "../WebGPUContext";
import { mat4, vec3 } from "gl-matrix";
import vs from "../shaders/terrain.vert.wgsl?raw";
import fs from "../shaders/terrain.frag.wgsl?raw";
import cs from "../shaders/erosion.comp.wgsl?raw";
import dropVs from "../shaders/droplet.vert.wgsl?raw";
import dropFs from "../shaders/droplet.frag.wgsl?raw";

class Terrain {
  constructor(size = 256, length = 100, numDrops = 4000) {
    this.size = size;
    this.length = length;
    this.numDrops = numDrops;

    // Matrices
    this.modelMatrix = mat4.create();
    this.viewProjectionMatrix = mat4.create();

    // Lighting defaults
    this.lightDirection = vec3.fromValues(0.5, 1.0, 0.5); // Top right front
    this.lightColor = vec3.fromValues(1.0, 1.0, 1.0); // White
    this.ambientColor = vec3.fromValues(0.2, 0.2, 0.2); // Dark grey

    // Erosion parameters
    this.erosionSettings = {
      inertia: 0.05, // Make drops turn easier
      gravity: 0.05, // Extremely sluggish acceleration
      capacity: 0.1, // Low pickup logic
      maxCapacity: 0.2,
      evaporation: 0.05, // Dies relatively quickly
      erosionRate: 0.05, // 10x higher bite strength
      depositionRate: 0.05, // 10x higher dropping strength
      minSlope: 0.005,
      iterations: 3, // Dispatch 3 compute steps per frame to offset the slow speed
      showDrops: true, // Show raindrops
    };

    this._generateGeometry();
    this._initWebGPU();
  }

  // Utility for consistent random
  _randomFloat(min, max) {
    return Math.random() * (max - min) + min;
  }

  _generateGeometry() {
    const { size, length } = this;
    const numVertices = size * size;
    const numIndices = (size - 1) * (size - 1) * 6;

    this.heightMap = new Float32Array(numVertices);
    this.indices = new Uint32Array(numIndices);

    const halfLength = length / 2;
    const step = length / (size - 1);

    const getHeight = (x, z) => {
      // Off-axis sine waves to break up the grid
      const f1 = 0.05;
      const f2 = 0.1;

      let h =
        Math.sin(x * f1 + z * f1 * 1.5) * Math.cos(z * f1 - x * f1 * 0.5) * 6.0;
      h += Math.sin(x * f2) * 2.0;
      h += Math.cos(z * f2) * 2.0;

      // Add a central peak to make it a bit more mountain-like
      const dist = Math.sqrt(x * x + z * z);
      h += Math.max(0, 10.0 - dist * 0.2);

      return h;
    };

    let vIdx = 0;
    for (let z = 0; z < size; z++) {
      for (let x = 0; x < size; x++) {
        // Positions
        const px = x * step - halfLength;
        const pz = z * step - halfLength;
        this.heightMap[vIdx] = getHeight(px, pz);
        vIdx++;
      }
    }

    let iIdx = 0;
    for (let z = 0; z < size - 1; z++) {
      for (let x = 0; x < size - 1; x++) {
        const topLeft = z * size + x;
        const topRight = topLeft + 1;
        const bottomLeft = (z + 1) * size + x;
        const bottomRight = bottomLeft + 1;

        // Triangle 1
        this.indices[iIdx++] = topLeft;
        this.indices[iIdx++] = bottomLeft;
        this.indices[iIdx++] = topRight;

        // Triangle 2
        this.indices[iIdx++] = topRight;
        this.indices[iIdx++] = bottomLeft;
        this.indices[iIdx++] = bottomRight;
      }
    }
  }

  _initWebGPU() {
    const { device, format } = WebGPUContext;

    // --- Buffers ---
    this.heightMapBuffer = device.createBuffer({
      size: this.heightMap.byteLength,
      // We will need STORAGE for reading in vertex shader and writing in compute shader
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true,
    });
    new Float32Array(this.heightMapBuffer.getMappedRange()).set(this.heightMap);
    this.heightMapBuffer.unmap();

    this.indexBuffer = device.createBuffer({
      size: this.indices.byteLength,
      usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true,
    });
    new Uint32Array(this.indexBuffer.getMappedRange()).set(this.indices);
    this.indexBuffer.unmap();

    // Total floats: 16 (viewProj) + 16 (model) = 32 floats -> 128 bytes
    // Light requires 256 byte alignment for its binding offset.
    // Matrix data: 0 - 127 bytes.
    // Lighting data: 256 - 303 bytes (48 bytes size).
    // Total buffer size = 256 (padding + matrices) + 256 (lighting data + padding) = 512 bytes.
    this.uniformBuffer = device.createBuffer({
      size: 512,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    this.uniformData = new Float32Array(512 / 4);

    // --- Compute Shader Drop Buffer ---
    // Drop struct:
    // pos: vec2<f32>   (2 floats)
    // dir: vec2<f32>   (2 floats)
    // vel: f32         (1 float)
    // water: f32       (1 float)
    // sediment: f32    (1 float)
    // padding          (1 float to align to vec4 boundaries)
    // Total: 8 floats -> 32 bytes per drop
    const dropData = new Float32Array(this.numDrops * 8);
    for (let i = 0; i < this.numDrops; i++) {
      const offset = i * 8;
      dropData[offset + 0] = this._randomFloat(0, this.size - 1); // posX
      dropData[offset + 1] = this._randomFloat(0, this.size - 1); // posZ
      dropData[offset + 2] = 0; // dirX
      dropData[offset + 3] = 0; // dirY
      dropData[offset + 4] = 1; // vel
      dropData[offset + 5] = 1; // water
      dropData[offset + 6] = 0; // sediment
    }

    this.dropBuffer = device.createBuffer({
      size: dropData.byteLength,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true,
    });
    new Float32Array(this.dropBuffer.getMappedRange()).set(dropData);
    this.dropBuffer.unmap();

    // --- Compute Shader Uniforms ---
    // f32: uSize, uInertia, uGravity, uCapacity, uMaxCapacity, uEvaporation, uErosionRate, uDepositionRate, uMinSlope + padding -> total 12 floats (48 bytes) aligned to 64
    this.erosionUniformBuffer = device.createBuffer({
      size: 64,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    this.erosionUniformData = new Float32Array(64 / 4);

    // --- Shader Modules ---
    const vertexShader = device.createShaderModule({ code: vs });
    const fragmentShader = device.createShaderModule({ code: fs });
    const computeShader = device.createShaderModule({ code: cs });

    // --- Render Pipeline ---
    this.renderPipeline = device.createRenderPipeline({
      layout: "auto",
      vertex: {
        module: vertexShader,
        entryPoint: "main",
        // No vertex buffers, we use vertex_index and storage pulling
        buffers: [],
      },
      fragment: {
        module: fragmentShader,
        entryPoint: "main",
        targets: [{ format }],
      },
      primitive: {
        topology: "triangle-list",
        cullMode: "back",
      },
      depthStencil: {
        depthWriteEnabled: true,
        depthCompare: "less",
        format: "depth24plus",
      },
    });

    // --- Compute Pipeline ---
    this.computePipeline = device.createComputePipeline({
      layout: "auto",
      compute: {
        module: computeShader,
        entryPoint: "main",
      },
    });

    // --- Droplet Render Pipeline ---
    const dropVsModule = device.createShaderModule({ code: dropVs });
    const dropFsModule = device.createShaderModule({ code: dropFs });

    this.dropletRenderPipeline = device.createRenderPipeline({
      layout: "auto",
      vertex: {
        module: dropVsModule,
        entryPoint: "main",
      },
      fragment: {
        module: dropFsModule,
        entryPoint: "main",
        targets: [{ format }],
      },
      primitive: {
        topology: "triangle-list", // Render drops as instanced quads
      },
      depthStencil: {
        depthWriteEnabled: true,
        depthCompare: "less",
        format: "depth24plus",
      },
    });

    // --- Render Bind Group ---
    this.renderBindGroup = device.createBindGroup({
      layout: this.renderPipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.uniformBuffer, size: 144 } }, // Matrices + Info
        {
          binding: 1,
          resource: { buffer: this.uniformBuffer, offset: 256, size: 48 },
        }, // Lighting
        { binding: 2, resource: { buffer: this.heightMapBuffer } }, // HeightMap storage
      ],
    });

    // --- Compute Bind Group ---
    this.computeBindGroup = device.createBindGroup({
      layout: this.computePipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.erosionUniformBuffer } },
        { binding: 1, resource: { buffer: this.heightMapBuffer } },
        { binding: 2, resource: { buffer: this.dropBuffer } },
      ],
    });

    // --- Droplet Render Bind Group ---
    this.dropletRenderBindGroup = device.createBindGroup({
      layout: this.dropletRenderPipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.uniformBuffer, size: 144 } }, // Matrices + Info
        { binding: 2, resource: { buffer: this.heightMapBuffer } }, // Bind heights for Y alignment
        { binding: 3, resource: { buffer: this.dropBuffer } }, // Bind the compute drops
      ],
    });
  }

  reset() {
    this._generateGeometry();
    const { device } = WebGPUContext;
    device.queue.writeBuffer(this.heightMapBuffer, 0, this.heightMap);
  }

  update() {
    const { device } = WebGPUContext;

    // Update erosion uniforms
    this.erosionUniformData[0] = this.size;
    this.erosionUniformData[1] = this.erosionSettings.inertia;
    this.erosionUniformData[2] = this.erosionSettings.gravity;
    this.erosionUniformData[3] = this.erosionSettings.capacity;
    this.erosionUniformData[4] = this.erosionSettings.maxCapacity;
    this.erosionUniformData[5] = this.erosionSettings.evaporation;
    this.erosionUniformData[6] = this.erosionSettings.erosionRate;
    this.erosionUniformData[7] = this.erosionSettings.depositionRate;
    this.erosionUniformData[8] = this.erosionSettings.minSlope;

    device.queue.writeBuffer(
      this.erosionUniformBuffer,
      0,
      this.erosionUniformData,
    );

    const commandEncoder = device.createCommandEncoder();
    const computePass = commandEncoder.beginComputePass();
    computePass.setPipeline(this.computePipeline);
    computePass.setBindGroup(0, this.computeBindGroup);

    // Dispatch compute groups based on drop count. Workgroup size = 64
    const workgroupCount = Math.ceil(this.numDrops / 64);
    for (let i = 0; i < this.erosionSettings.iterations; i++) {
      computePass.dispatchWorkgroups(workgroupCount);
    }
    computePass.end();

    // Submit compute pass to queue immediately before render phase
    device.queue.submit([commandEncoder.finish()]);
  }

  _updateRenderUniforms(camera) {
    const { device } = WebGPUContext;

    // ViewProjection
    mat4.multiply(
      this.viewProjectionMatrix,
      camera.projectionMatrix,
      camera.viewMatrix,
    );

    // Fill float array
    this.uniformData.set(this.viewProjectionMatrix, 0);
    this.uniformData.set(this.modelMatrix, 16);
    this.uniformData[32] = this.size;
    this.uniformData[33] = this.length;

    // Lighting at offset 64 floats (256 bytes)
    this.uniformData.set(this.lightDirection, 64);
    // index 67 is padding
    this.uniformData.set(this.lightColor, 68);
    // index 71 is padding
    this.uniformData.set(this.ambientColor, 72);

    device.queue.writeBuffer(this.uniformBuffer, 0, this.uniformData);
  }

  draw(passEncoder, camera) {
    this._updateRenderUniforms(camera);

    // 1. Draw the terrain grid
    passEncoder.setPipeline(this.renderPipeline);
    passEncoder.setBindGroup(0, this.renderBindGroup);
    passEncoder.setIndexBuffer(this.indexBuffer, "uint32");
    passEncoder.drawIndexed(this.indices.length);

    // 2. Overlay the moving raindrops
    if (this.erosionSettings.showDrops) {
      passEncoder.setPipeline(this.dropletRenderPipeline);
      passEncoder.setBindGroup(0, this.dropletRenderBindGroup);
      passEncoder.draw(6, this.numDrops); // 6 vertices per quad, 1 instance per drop
    }
  }
}

export default Terrain;
