import {
  assertWebGPUSupport,
  beginRenderPass,
  BindGroup,
  Buffer,
  BufferUsage,
  Compute,
  createSceneUniformPipelineLayout,
  depthOnlyTriangles,
  DepthDraw,
  Device,
  Draw,
  fitOrthographicCameraToSphere,
  Geom,
  HitTestor,
  Mesh,
  OrbitalControl,
  OrthographicCamera,
  PerspectiveCamera,
  opaqueTriangles,
  ShadowMap,
  UniformBlock,
  wgslShadowPcf3x3,
} from "belfast";
import FluidSimulation, { SlicePlane } from "@fluid-sim-belfast";
import { vec3 } from "gl-matrix";
import Config from "./Config";
import { createParticleData } from "./particleData";
import { createParticleShadowRadius } from "./shadowBounds";
import Settings from "./Settings";
import cubeDrawShaderSource from "./shaders/cubes-draw.wgsl?raw";
import cubeShadowShaderCode from "./shaders/cubes-shadow.wgsl?raw";
import drawShaderSource from "./shaders/particles-draw.wgsl?raw";
import shadowShaderCode from "./shaders/particles-shadow.wgsl?raw";
import updateShaderCode from "./shaders/particles-update.wgsl?raw";
import "./style.css";

const drawShaderCode = `${wgslShadowPcf3x3}\n${drawShaderSource}`;
const cubeDrawShaderCode = `${wgslShadowPcf3x3}\n${cubeDrawShaderSource}`;

const PARTICLE_COUNT = 300_000;
const CUBE_COUNT = 100_000;
const WORKGROUP_SIZE = 256;
const MAX_RADIUS = 9;
const PARTICLE_TRIANGLE_POSITIONS = new Float32Array([
  0, 1, 0, -0.8660254, -0.5, 0, 0.8660254, -0.5, 0,
]);
const FLUID_VOLUME_EXTENT = MAX_RADIUS * 2;
const SHADOW_MAP_SIZE = 1024 * 2;
const SIMULATION_OVERSHOOT = 1.35;
const SHADOW_PADDING = 0.75;
const SHADOW_STRENGTH = 0.65;
const SHADOW_BIAS = 0.002;
const LIGHT_POSITION: [number, number, number] = [1, 18, 8];
const LIGHT_UP: [number, number, number] = [0, 0, -1];
const HIT_TEST_RADIUS = MAX_RADIUS * 0.5;
const RAD = Math.PI / 180;
const SIM_PARAMS = {
  maxRadius: MAX_RADIUS * 1.25,
  fluidForceScale: 2.8,
  densityForceScale: 0.02,
  damping: 0.998,
  centerForce: 8.4,
};
const SIM_PARAMS_SCHEMA = {
  time: "f32",
  dt: "f32",
  maxRadius: "f32",
  count: "u32",
  fluidForceScale: "f32",
  densityForceScale: "f32",
  damping: "f32",
  centerForce: "f32",
} as const;
const SIM_PARAMS_BYTE_SIZE = Buffer.uniformSize(
  UniformBlock.create(SIM_PARAMS_SCHEMA).byteSize
);

const createSimParamsUniforms = (count: number) =>
  UniformBlock.create(SIM_PARAMS_SCHEMA)
    .set("time", 0)
    .set("dt", 1 / 60)
    .set("maxRadius", SIM_PARAMS.maxRadius)
    .set("count", count)
    .set("fluidForceScale", SIM_PARAMS.fluidForceScale)
    .set("densityForceScale", SIM_PARAMS.densityForceScale)
    .set("damping", SIM_PARAMS.damping)
    .set("centerForce", SIM_PARAMS.centerForce);

async function main() {
  await assertWebGPUSupport();
  Settings.init();

  const canvas = document.createElement("canvas");
  canvas.className = "app-canvas";
  document.body.appendChild(canvas);

  const label = document.createElement("div");
  label.textContent = `${PARTICLE_COUNT.toLocaleString()} fluid particles`;
  label.className = "particle-count-label";
  document.body.appendChild(label);
  const {
    fluidTextureSize,
    advectionScale,
    curl,
    densityDissipation,
    velocityDissipation,
    pressureIterations,
  } = Config;

  const device = await Device.create(canvas);
  const fluid = new FluidSimulation(
    device,
    {
      TEXTURE_SIZE: fluidTextureSize,
      DENSITY_DISSIPATION: densityDissipation,
      VELOCITY_DISSIPATION: velocityDissipation,
      PRESSURE_DISSIPATION: 0.95,
      PRESSURE_ITERATIONS: pressureIterations,
      CURL: curl,
      ADVECTION_SCALE: advectionScale,
    },
    MAX_RADIUS
  );
  const densitySlicePlane = new SlicePlane(device, {
    texSize: fluidTextureSize,
    volumeExtent: FLUID_VOLUME_EXTENT,
  });
  const velocitySlicePlane = new SlicePlane(device, {
    texSize: fluidTextureSize,
    volumeExtent: FLUID_VOLUME_EXTENT,
  });

  const initialData = createParticleData({
    count: PARTICLE_COUNT,
    radius: MAX_RADIUS,
  });
  const initialCubeData = createParticleData({
    count: CUBE_COUNT,
    radius: MAX_RADIUS,
    baseScale: 1,
  });

  const particleBuffers = [
    Buffer.fromData(device, initialData, BufferUsage.storage, "particles-a"),
    Buffer.fromData(device, initialData, BufferUsage.storage, "particles-b"),
  ];
  const cubeBuffers = [
    Buffer.fromData(device, initialCubeData, BufferUsage.storage, "cubes-a"),
    Buffer.fromData(device, initialCubeData, BufferUsage.storage, "cubes-b"),
  ];

  const positionBuffer = Buffer.fromData(
    device,
    PARTICLE_TRIANGLE_POSITIONS,
    BufferUsage.vertex,
    "particle-triangle-positions"
  );
  const mesh = new Mesh(PARTICLE_TRIANGLE_POSITIONS.length / 3).addVertexBuffer(
    {
      buffer: positionBuffer,
      arrayStride: 12,
      attributes: [{ shaderLocation: 0, format: "float32x3", offset: 0 }],
      slot: 0,
      stepMode: "vertex",
    }
  );
  const cubeGeometry = Geom.cube({ size: 2 });
  const cubePositionBuffer = Buffer.fromData(
    device,
    cubeGeometry.positions,
    BufferUsage.vertex,
    "cube-positions"
  );
  const cubeNormalBuffer = Buffer.fromData(
    device,
    cubeGeometry.normals,
    BufferUsage.vertex,
    "cube-normals"
  );
  const cubeIndexBuffer = Buffer.fromData(
    device,
    cubeGeometry.indices,
    BufferUsage.index,
    "cube-indices"
  );
  const cubeMesh = new Mesh(cubeGeometry.positions.length / 3)
    .addVertexBuffer({
      buffer: cubePositionBuffer,
      arrayStride: 12,
      attributes: [{ shaderLocation: 0, format: "float32x3", offset: 0 }],
      slot: 0,
      stepMode: "vertex",
    })
    .addVertexBuffer({
      buffer: cubeNormalBuffer,
      arrayStride: 12,
      attributes: [{ shaderLocation: 1, format: "float32x3", offset: 0 }],
      slot: 1,
      stepMode: "vertex",
    })
    .setIndexBuffer(
      cubeIndexBuffer,
      cubeGeometry.indices.length,
      cubeGeometry.indices instanceof Uint32Array ? "uint32" : "uint16"
    );

  const cameraUniformBuffer = Buffer.create(
    device,
    Buffer.uniformSize(PerspectiveCamera.uniformByteSize()),
    BufferUsage.uniform,
    "camera-uniforms"
  );
  const cameraUniformData = new Float32Array(
    PerspectiveCamera.uniformFloatCount
  );
  const camera = new PerspectiveCamera(45 * RAD, 1, 0.1, 300);
  const control = new OrbitalControl(camera, {
    listenerTarget: canvas,
    center: [0, 0, 0],
    radius: MAX_RADIUS * 4,
    sensitivity: 1,
    zoomSpeed: 0.8,
    panSpeed: 0.02,
  });
  control.rx.setTo(-0.22);
  control.ry.setTo(0.72);

  const hitTestor = new HitTestor(
    Geom.sphere({ radius: HIT_TEST_RADIUS, segments: 24 }),
    camera,
    [canvas.width, canvas.height],
    { listenerTarget: canvas }
  );
  const params = Config;
  const overlay = import.meta.env.DEV
    ? new (await import("./DevelopmentOverlay")).DevelopmentOverlay({
        fluid,
        maxRadius: MAX_RADIUS,
      })
    : null;

  let firstHit = true;
  const lastHit = vec3.create();
  hitTestor.addEventListener("onHit", ((e: CustomEvent) => {
    const hit = e.detail.hit;

    if (firstHit) {
      vec3.copy(lastHit, hit);
      firstHit = false;
      return;
    }

    const dir = vec3.create();
    vec3.sub(dir, hit, lastHit);

    const speed = vec3.length(dir);
    if (speed > 0.001 && speed < MAX_RADIUS) {
      const d = vec3.clone(dir);
      vec3.normalize(d, d);
      const forceStrength = params.strength * (speed * 500.0);

      fluid.addForce(
        [hit[0], hit[1], hit[2]],
        [d[0], d[1], d[2]],
        params.radius,
        forceStrength,
        1,
        params.noiseStrength
      );
    }
    vec3.copy(lastHit, hit);
  }) as EventListener);

  const lightCamera = new OrthographicCamera(-1, 1, -1, 1, 0.1, 100);
  fitOrthographicCameraToSphere({
    camera: lightCamera,
    center: [0, 0, 0],
    radius:
      createParticleShadowRadius({
        maxRadius: MAX_RADIUS,
        overshootMultiplier: SIMULATION_OVERSHOOT,
        billboardPadding: SHADOW_PADDING,
      }) + 1.0,
    eye: LIGHT_POSITION,
    up: LIGHT_UP,
    padding: 1,
  });

  const lightCameraUniformBuffer = Buffer.create(
    device,
    Buffer.uniformSize(OrthographicCamera.uniformByteSize()),
    BufferUsage.uniform,
    "light-camera-uniforms"
  );
  const lightCameraUniformData = new Float32Array(
    OrthographicCamera.uniformFloatCount
  );
  lightCamera.writeUniformData(lightCameraUniformData);
  lightCameraUniformBuffer.write(device, lightCameraUniformData);

  const sliceCamera = new OrthographicCamera(-1, 1, -1, 1, 0.1, 100);
  fitOrthographicCameraToSphere({
    camera: sliceCamera,
    center: [0, 0, 0],
    radius: MAX_RADIUS,
    eye: [0, 0, MAX_RADIUS * 3],
    up: [0, 1, 0],
  });

  const particleSimParamsBuffer = Buffer.create(
    device,
    SIM_PARAMS_BYTE_SIZE,
    BufferUsage.uniform,
    "particle-sim-params"
  );
  const cubeSimParamsBuffer = Buffer.create(
    device,
    SIM_PARAMS_BYTE_SIZE,
    BufferUsage.uniform,
    "cube-sim-params"
  );
  const particleSimParamsUniforms = createSimParamsUniforms(PARTICLE_COUNT);
  const cubeSimParamsUniforms = createSimParamsUniforms(CUBE_COUNT);

  const updateCompute = new Compute(device, updateShaderCode, {
    label: "ParticlesUpdate",
    entryPoint: "cs_main",
  });
  const createUpdateBindGroup = (
    buffers: Buffer[],
    simParamsBuffer: Buffer,
    readIndex: number,
    writeIndex: number,
    label: string
  ) =>
    BindGroup.create(
      device,
      updateCompute.getBindGroupLayout(0),
      [
        { binding: 0, resource: simParamsBuffer },
        { binding: 1, resource: buffers[readIndex] },
        { binding: 2, resource: buffers[writeIndex] },
        { binding: 3, resource: fluid.velocity.view },
        { binding: 4, resource: fluid.density.view },
      ],
      `${label}-update-${readIndex}-to-${writeIndex}`
    );

  const scene = createSceneUniformPipelineLayout(device, "ParticlesScene");
  const particleBindGroupLayout = device.gpu.createBindGroupLayout({
    label: "ParticlesStorageLayout",
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.VERTEX,
        buffer: { type: "read-only-storage" },
      },
    ],
  });
  const shadowBindGroupLayout = device.gpu.createBindGroupLayout({
    label: "ParticlesShadowLayout",
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        buffer: { type: "uniform" },
      },
      {
        binding: 1,
        visibility: GPUShaderStage.FRAGMENT,
        texture: { sampleType: "depth" },
      },
      {
        binding: 2,
        visibility: GPUShaderStage.FRAGMENT,
        sampler: { type: "comparison" },
      },
    ],
  });
  const shadowPipelineLayout = device.gpu.createPipelineLayout({
    label: "ParticlesShadowPipelineLayout",
    bindGroupLayouts: [scene.bindGroupLayout, particleBindGroupLayout],
  });
  const drawPipelineLayout = device.gpu.createPipelineLayout({
    label: "ParticlesPipelineLayout",
    bindGroupLayouts: [
      scene.bindGroupLayout,
      particleBindGroupLayout,
      shadowBindGroupLayout,
    ],
  });
  const shadowDraw = new DepthDraw(device, shadowShaderCode, {
    label: "ParticlesShadowDraw",
    layout: shadowPipelineLayout,
    vertexBuffers: mesh.getVertexLayouts(),
    ...depthOnlyTriangles({ cullMode: "none", depthFormat: "depth32float" }),
  });
  const cubeShadowDraw = new DepthDraw(device, cubeShadowShaderCode, {
    label: "CubesShadowDraw",
    layout: shadowPipelineLayout,
    vertexBuffers: cubeMesh.getVertexLayouts(),
    ...depthOnlyTriangles({ cullMode: "back", depthFormat: "depth32float" }),
  });
  const draw = new Draw(device, drawShaderCode, {
    label: "ParticlesDraw",
    layout: drawPipelineLayout,
    vertexBuffers: mesh.getVertexLayouts(),
    ...opaqueTriangles({ cullMode: "none", colorFormat: device.format }),
  });
  const cubeDraw = new Draw(device, cubeDrawShaderCode, {
    label: "CubesDraw",
    layout: drawPipelineLayout,
    vertexBuffers: cubeMesh.getVertexLayouts(),
    ...opaqueTriangles({ cullMode: "back", colorFormat: device.format }),
  });
  const sceneBindGroup = BindGroup.create(
    device,
    scene.bindGroupLayout,
    cameraUniformBuffer,
    0,
    "scene-bind-group"
  );
  const lightSceneBindGroup = BindGroup.create(
    device,
    scene.bindGroupLayout,
    lightCameraUniformBuffer,
    0,
    "light-scene-bind-group"
  );
  const particleDrawBindGroups = particleBuffers.map((buffer, index) =>
    BindGroup.create(
      device,
      particleBindGroupLayout,
      [{ binding: 0, resource: buffer }],
      `particle-draw-${index}`
    )
  );
  const cubeDrawBindGroups = cubeBuffers.map((buffer, index) =>
    BindGroup.create(
      device,
      particleBindGroupLayout,
      [{ binding: 0, resource: buffer }],
      `cube-draw-${index}`
    )
  );
  const shadowMap = ShadowMap.create(device, {
    label: "ParticlesShadowMap",
    size: SHADOW_MAP_SIZE,
    format: "depth32float",
  });
  const shadowUniformBuffer = Buffer.create(
    device,
    Buffer.uniformSize(80),
    BufferUsage.uniform,
    "shadow-uniforms"
  );
  const shadowUniformData = new Float32Array(20);
  shadowUniformData.set(lightCamera.getViewProjectionMatrix(), 0);
  shadowUniformData[16] = SHADOW_STRENGTH;
  shadowUniformData[17] = SHADOW_MAP_SIZE;
  shadowUniformData[18] = SHADOW_BIAS;
  shadowUniformBuffer.write(device, shadowUniformData);
  const shadowBindGroup = BindGroup.create(
    device,
    shadowBindGroupLayout,
    [
      { binding: 0, resource: shadowUniformBuffer },
      { binding: 1, resource: shadowMap.view },
      { binding: 2, resource: shadowMap.sampler },
    ],
    "shadow-bind-group"
  );

  let depthTexture: GPUTexture | null = null;
  let lastWidth = 0;
  let lastHeight = 0;
  let readIndex = 0;
  let lastTime = performance.now();

  const updateAspect = () => {
    if (canvas.width === lastWidth && canvas.height === lastHeight) {
      return;
    }
    lastWidth = canvas.width;
    lastHeight = canvas.height;
    if (lastWidth > 0 && lastHeight > 0) {
      camera.setAspect(lastWidth / lastHeight);
      hitTestor.resolution = [lastWidth, lastHeight];
    }
  };

  const ensureDepthTexture = () => {
    const width = canvas.width;
    const height = canvas.height;
    if (
      depthTexture &&
      depthTexture.width === width &&
      depthTexture.height === height
    ) {
      return depthTexture.createView();
    }

    depthTexture?.destroy();
    depthTexture = device.gpu.createTexture({
      label: "depth-texture",
      size: [width, height],
      format: "depth24plus",
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
    return depthTexture.createView();
  };

  const drawFluidSlice = (
    pass: GPURenderPassEncoder,
    width: number,
    height: number
  ) => {
    if (
      !params.showFluidSlice ||
      (!params.showSliceVelocity && !params.showSliceDensity)
    ) {
      return;
    }

    const slices = [
      {
        visible: params.showSliceDensity,
        plane: densitySlicePlane,
        showVelocity: false,
        showDensity: true,
      },
      {
        visible: params.showSliceVelocity,
        plane: velocitySlicePlane,
        showVelocity: true,
        showDensity: false,
      },
    ].filter((slice) => slice.visible);
    const margin = 14;
    const gap = 10;
    const size = Math.max(
      140,
      Math.min(280, Math.floor(Math.min(width, height) * 0.24))
    );
    const y = Math.max(margin, height - size - margin);

    for (let i = 0; i < slices.length; i++) {
      const x = margin + i * (size + gap);
      pass.setViewport(x, y, size, size, 0, 1);
      pass.setScissorRect(x, y, size, size);
      slices[i].plane.draw(
        pass,
        fluid.velocity,
        fluid.density,
        sliceCamera.getViewProjectionMatrix(),
        {
          showVelocity: slices[i].showVelocity,
          showDensity: slices[i].showDensity,
          densityGain: 6,
          velocityThreshold: 1.2,
        }
      );
    }
  };

  const render = (now: number) => {
    overlay?.begin();
    device.resize();
    updateAspect();

    const dt = Math.min(1 / 30, Math.max(1 / 240, (now - lastTime) / 1000));
    lastTime = now;
    const time = now * 0.001;
    particleSimParamsUniforms
      .set("time", time)
      .set("dt", dt)
      .writeToBuffer(particleSimParamsBuffer, device);
    cubeSimParamsUniforms
      .set("time", time)
      .set("dt", dt)
      .writeToBuffer(cubeSimParamsBuffer, device);

    camera.writeUniformData(cameraUniformData);
    cameraUniformBuffer.write(device, cameraUniformData);

    const writeIndex = 1 - readIndex;
    const colorView = device.getCurrentTexture().createView();
    const depthView = ensureDepthTexture();
    const encoder = device.gpu.createCommandEncoder({
      label: "fluid-particles-frame",
    });

    // addFluidEmitterForces(now * 0.001);
    fluid.update(encoder, dt);

    const computePass = encoder.beginComputePass({ label: "update-particles" });
    updateCompute.dispatch(
      computePass,
      createUpdateBindGroup(
        particleBuffers,
        particleSimParamsBuffer,
        readIndex,
        writeIndex,
        "particles"
      ),
      Math.ceil(PARTICLE_COUNT / WORKGROUP_SIZE)
    );
    updateCompute.dispatch(
      computePass,
      createUpdateBindGroup(
        cubeBuffers,
        cubeSimParamsBuffer,
        readIndex,
        writeIndex,
        "cubes"
      ),
      Math.ceil(CUBE_COUNT / WORKGROUP_SIZE)
    );
    computePass.end();

    const shadowPass = shadowMap.beginRenderPass(encoder);
    shadowDraw.draw(
      shadowPass,
      mesh,
      [lightSceneBindGroup, particleDrawBindGroups[writeIndex]],
      PARTICLE_COUNT
    );
    cubeShadowDraw.draw(
      shadowPass,
      cubeMesh,
      [lightSceneBindGroup, cubeDrawBindGroups[writeIndex]],
      CUBE_COUNT
    );
    shadowPass.end();

    const pass = beginRenderPass(encoder, colorView, {
      clearColor: { r: 0.015, g: 0.014, b: 0.012, a: 1 },
      depthStencilAttachment: {
        view: depthView,
        depthLoadOp: "clear",
        depthClearValue: 1,
        depthStoreOp: "store",
      },
    });
    draw.draw(
      pass,
      mesh,
      [sceneBindGroup, particleDrawBindGroups[writeIndex], shadowBindGroup],
      PARTICLE_COUNT
    );
    cubeDraw.draw(
      pass,
      cubeMesh,
      [sceneBindGroup, cubeDrawBindGroups[writeIndex], shadowBindGroup],
      CUBE_COUNT
    );
    pass.end();

    const slicePass = beginRenderPass(encoder, colorView, {
      loadOp: "load",
      depthStencilAttachment: {
        view: depthView,
        depthLoadOp: "clear",
        depthClearValue: 1,
        depthStoreOp: "store",
      },
    });
    drawFluidSlice(slicePass, canvas.width, canvas.height);
    slicePass.end();

    device.gpu.queue.submit([encoder.finish()]);
    readIndex = writeIndex;

    overlay?.end();
    requestAnimationFrame(render);
  };

  window.addEventListener("beforeunload", () => {
    hitTestor.disconnect();
    control.destroy();
    overlay?.destroy();
    densitySlicePlane.destroy();
    velocitySlicePlane.destroy();
    fluid.destroy();
    depthTexture?.destroy();
    cameraUniformBuffer.destroy();
    lightCameraUniformBuffer.destroy();
    particleSimParamsBuffer.destroy();
    cubeSimParamsBuffer.destroy();
    shadowUniformBuffer.destroy();
    shadowMap.destroy();
    positionBuffer.destroy();
    cubePositionBuffer.destroy();
    cubeNormalBuffer.destroy();
    cubeIndexBuffer.destroy();
    particleBuffers.forEach((buffer) => buffer.destroy());
    cubeBuffers.forEach((buffer) => buffer.destroy());
  });

  requestAnimationFrame(render);
}

main().catch((error) => {
  console.error(error);
});
