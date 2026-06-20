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
import { syncCanvasPixelSize } from "./canvasSize";
import Config from "./Config";
import { createParticleData } from "./particleData";
import { createParticleShadowRadius } from "./shadowBounds";
import {
  WIRE_SIDES,
  createWireGeometry,
  createWireHistoryData,
  createWireHistoryLength,
  createWireHistoryInvocationCount,
  createWireParticleCount,
} from "./wireData";
import Settings from "./Settings";
import updateShaderCode from "./shaders/particles-update.wgsl?raw";
import wireDrawShaderSource from "./shaders/wires-draw.wgsl?raw";
import wireHistoryAdvectShaderCode from "./shaders/wires-history-advect.wgsl?raw";
import wireHistoryWriteShaderCode from "./shaders/wires-history-write.wgsl?raw";
import wireShadowShaderCode from "./shaders/wires-shadow.wgsl?raw";
import "./style.css";

const wireDrawShaderCode = `${wgslShadowPcf3x3}\n${wireDrawShaderSource}`;

const WORKGROUP_SIZE = 256;
const MAX_RADIUS = 9;
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
  damping: 0.984,
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
const HISTORY_PARAMS_SCHEMA = {
  writeSlot: "u32",
  historyLength: "u32",
  particleCount: "u32",
  radiusScale: "f32",
  dt: "f32",
  maxRadius: "f32",
  historyFluidStrength: "f32",
  densityForceScale: "f32",
} as const;
const HISTORY_PARAMS_BYTE_SIZE = Buffer.uniformSize(
  UniformBlock.create(HISTORY_PARAMS_SCHEMA).byteSize
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
  const particleCount = createWireParticleCount(Config.particleGridSize);
  const historyLength = createWireHistoryLength(Config.wireTileCount);
  const historyInvocationCount = createWireHistoryInvocationCount({
    particleCount,
    historyLength,
  });

  const canvas = document.createElement("canvas");
  canvas.className = "app-canvas";
  document.body.appendChild(canvas);

  const label = document.createElement("div");
  label.textContent = `${particleCount.toLocaleString()} fluid wires`;
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
    count: particleCount,
    radius: MAX_RADIUS,
  });
  const initialHistoryData = createWireHistoryData({
    particles: initialData,
    particleCount,
    historyLength,
  });

  const particleBuffers = [
    Buffer.fromData(device, initialData, BufferUsage.storage, "particles-a"),
    Buffer.fromData(device, initialData, BufferUsage.storage, "particles-b"),
  ];
  const historyBuffer = Buffer.fromData(
    device,
    initialHistoryData,
    BufferUsage.storage,
    "wire-history"
  );

  const wireGeometry = createWireGeometry({
    historyLength,
    sides: WIRE_SIDES,
  });
  const wireNodeSideBuffer = Buffer.fromData(
    device,
    wireGeometry.nodeSides,
    BufferUsage.vertex,
    "wire-node-sides"
  );
  const wireMesh = new Mesh(wireGeometry.vertexCount).addVertexBuffer({
    buffer: wireNodeSideBuffer,
    arrayStride: 8,
    attributes: [{ shaderLocation: 0, format: "float32x2", offset: 0 }],
    slot: 0,
    stepMode: "vertex",
  });

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
  const particleSimParamsUniforms = createSimParamsUniforms(particleCount);
  const historyParamsBuffer = Buffer.create(
    device,
    HISTORY_PARAMS_BYTE_SIZE,
    BufferUsage.uniform,
    "wire-history-params"
  );
  const historyParamsUniforms = UniformBlock.create(HISTORY_PARAMS_SCHEMA)
    .set("writeSlot", 0)
    .set("historyLength", historyLength)
    .set("particleCount", particleCount)
    .set("radiusScale", Config.wireThicknessScale)
    .set("dt", 1 / 60)
    .set("maxRadius", SIM_PARAMS.maxRadius)
    .set("historyFluidStrength", Config.historyFluidStrength)
    .set("densityForceScale", SIM_PARAMS.densityForceScale);

  const updateCompute = new Compute(device, updateShaderCode, {
    label: "WireParticlesUpdate",
    entryPoint: "cs_main",
  });
  const historyWriteCompute = new Compute(device, wireHistoryWriteShaderCode, {
    label: "WireHistoryWrite",
    entryPoint: "cs_main",
  });
  const historyAdvectCompute = new Compute(
    device,
    wireHistoryAdvectShaderCode,
    {
      label: "WireHistoryAdvect",
      entryPoint: "cs_main",
    }
  );
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
  const createHistoryWriteBindGroup = (particleBuffer: Buffer) =>
    BindGroup.create(
      device,
      historyWriteCompute.getBindGroupLayout(0),
      [
        { binding: 0, resource: historyParamsBuffer },
        { binding: 1, resource: particleBuffer },
        { binding: 2, resource: historyBuffer },
      ],
      "wire-history-write"
    );
  const historyAdvectBindGroup = BindGroup.create(
    device,
    historyAdvectCompute.getBindGroupLayout(0),
    [
      { binding: 0, resource: historyParamsBuffer },
      { binding: 1, resource: historyBuffer },
      { binding: 2, resource: fluid.velocity.view },
      { binding: 3, resource: fluid.density.view },
    ],
    "wire-history-advect"
  );

  const scene = createSceneUniformPipelineLayout(device, "ParticlesScene");
  const wireHistoryBindGroupLayout = device.gpu.createBindGroupLayout({
    label: "WireHistoryLayout",
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.VERTEX,
        buffer: { type: "read-only-storage" },
      },
      {
        binding: 1,
        visibility: GPUShaderStage.VERTEX,
        buffer: { type: "uniform" },
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
    label: "WiresShadowPipelineLayout",
    bindGroupLayouts: [scene.bindGroupLayout, wireHistoryBindGroupLayout],
  });
  const drawPipelineLayout = device.gpu.createPipelineLayout({
    label: "WiresPipelineLayout",
    bindGroupLayouts: [
      scene.bindGroupLayout,
      wireHistoryBindGroupLayout,
      shadowBindGroupLayout,
    ],
  });
  const wireShadowDraw = new DepthDraw(device, wireShadowShaderCode, {
    label: "WiresShadowDraw",
    layout: shadowPipelineLayout,
    vertexBuffers: wireMesh.getVertexLayouts(),
    ...depthOnlyTriangles({ cullMode: "none", depthFormat: "depth32float" }),
  });
  const wireDraw = new Draw(device, wireDrawShaderCode, {
    label: "WiresDraw",
    layout: drawPipelineLayout,
    vertexBuffers: wireMesh.getVertexLayouts(),
    ...opaqueTriangles({ cullMode: "none", colorFormat: device.format }),
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
  const wireHistoryBindGroup = BindGroup.create(
    device,
    wireHistoryBindGroupLayout,
    [
      { binding: 0, resource: historyBuffer },
      { binding: 1, resource: historyParamsBuffer },
    ],
    "wire-history-bind-group"
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
  let historyWriteSlot = 0;
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
    syncCanvasPixelSize(canvas, window.devicePixelRatio);
    updateAspect();

    const dt = Math.min(1 / 30, Math.max(1 / 240, (now - lastTime) / 1000));
    lastTime = now;
    const time = now * 0.001;
    particleSimParamsUniforms
      .set("time", time)
      .set("dt", dt)
      .writeToBuffer(particleSimParamsBuffer, device);
    historyParamsUniforms
      .set("writeSlot", historyWriteSlot)
      .set("radiusScale", Config.wireThicknessScale)
      .set("dt", dt)
      .set("historyFluidStrength", Config.historyFluidStrength)
      .writeToBuffer(historyParamsBuffer, device);

    camera.writeUniformData(cameraUniformData);
    cameraUniformBuffer.write(device, cameraUniformData);

    const writeIndex = 1 - readIndex;
    const colorView = device.getCurrentTexture().createView();
    const depthView = ensureDepthTexture();
    const encoder = device.gpu.createCommandEncoder({
      label: "fluid-wires-frame",
    });

    // addFluidEmitterForces(now * 0.001);
    fluid.update(encoder, dt);

    const computePass = encoder.beginComputePass({
      label: "update-wire-particles",
    });
    updateCompute.dispatch(
      computePass,
      createUpdateBindGroup(
        particleBuffers,
        particleSimParamsBuffer,
        readIndex,
        writeIndex,
        "particles"
      ),
      Math.ceil(particleCount / WORKGROUP_SIZE)
    );
    historyWriteCompute.dispatch(
      computePass,
      createHistoryWriteBindGroup(particleBuffers[writeIndex]),
      Math.ceil(particleCount / WORKGROUP_SIZE)
    );
    historyAdvectCompute.dispatch(
      computePass,
      historyAdvectBindGroup,
      Math.ceil(historyInvocationCount / WORKGROUP_SIZE)
    );
    computePass.end();

    const shadowPass = shadowMap.beginRenderPass(encoder);
    wireShadowDraw.draw(
      shadowPass,
      wireMesh,
      [lightSceneBindGroup, wireHistoryBindGroup],
      particleCount
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
    wireDraw.draw(
      pass,
      wireMesh,
      [sceneBindGroup, wireHistoryBindGroup, shadowBindGroup],
      particleCount
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
    historyWriteSlot = (historyWriteSlot + 1) % historyLength;

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
    historyParamsBuffer.destroy();
    shadowUniformBuffer.destroy();
    shadowMap.destroy();
    wireNodeSideBuffer.destroy();
    historyBuffer.destroy();
    particleBuffers.forEach((buffer) => buffer.destroy());
  });

  requestAnimationFrame(render);
}

main().catch((error) => {
  console.error(error);
});
