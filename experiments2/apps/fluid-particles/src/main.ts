import {
  assertWebGPUSupport,
  beginRenderPass,
  BindGroup,
  Buffer,
  BufferUsage,
  Compute,
  createPlaneTriangleList,
  createSceneUniformPipelineLayout,
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
  ShadowMap,
  wgslShadowPcf3x3,
} from "belfast";
import FluidSimulation, { SlicePlane } from "@fluid-sim-belfast";
import { vec3 } from "gl-matrix";
import GUI from "lil-gui";
import Stats from "stats.js";
import { createParticleData } from "./particleData";
import { createParticleShadowRadius } from "./shadowBounds";
import drawShaderSource from "./shaders/particles-draw.wgsl?raw";
import shadowShaderCode from "./shaders/particles-shadow.wgsl?raw";
import updateShaderCode from "./shaders/particles-update.wgsl?raw";

const drawShaderCode = `${wgslShadowPcf3x3}\n${drawShaderSource}`;

const PARTICLE_COUNT = 500_000;
const WORKGROUP_SIZE = 256;
const MAX_RADIUS = 9;
const FLUID_TEXTURE_SIZE = 64;
const FLUID_VOLUME_EXTENT = MAX_RADIUS * 2;
const FLUID_EMITTER = {
  strength: 150,
  radius: 6,
  swirlStrength: 0.9,
  swirlRadius: MAX_RADIUS * 0.35,
  updraft: 0.55,
  forceCount: 8,
  noiseStrength: 0.35,
};
const SHADOW_MAP_SIZE = 1024;
const SIMULATION_OVERSHOOT = 1.35;
const SHADOW_PADDING = 0.75;
const SHADOW_STRENGTH = 0.65;
const SHADOW_BIAS = 0.002;
const LIGHT_POSITION: [number, number, number] = [1, 18, 8];
const LIGHT_UP: [number, number, number] = [0, 0, -1];
const HIT_TEST_RADIUS = MAX_RADIUS * 0.75;
const RAD = Math.PI / 180;

async function main() {
  await assertWebGPUSupport();

  const canvas = document.createElement("canvas");
  canvas.style.cssText =
    "display:block;width:100vw;height:100vh;touch-action:none;";
  document.body.appendChild(canvas);

  const stats = new Stats();
  stats.showPanel(0);
  stats.dom.style.cssText = "position:fixed;top:0;left:0;z-index:10;";
  document.body.appendChild(stats.dom);

  const label = document.createElement("div");
  label.textContent = `${PARTICLE_COUNT.toLocaleString()} fluid particles`;
  label.style.cssText =
    "position:fixed;right:14px;bottom:12px;z-index:10;color:#d8d8d8;" +
    "font:12px/1.45 ui-sans-serif,system-ui,sans-serif;" +
    "letter-spacing:0;text-shadow:0 1px 2px rgba(0,0,0,0.7);" +
    "pointer-events:none;user-select:none;";
  document.body.appendChild(label);

  const device = await Device.create(canvas);
  const fluid = new FluidSimulation(
    device,
    {
      TEXTURE_SIZE: FLUID_TEXTURE_SIZE,
      DENSITY_DISSIPATION: 0.95,
      VELOCITY_DISSIPATION: 0.98,
      PRESSURE_DISSIPATION: 0.95,
      PRESSURE_ITERATIONS: 24,
      CURL: 6,
      ADVECTION_SCALE: 16,
    },
    MAX_RADIUS
  );
  const densitySlicePlane = new SlicePlane(device, {
    texSize: FLUID_TEXTURE_SIZE,
    volumeExtent: FLUID_VOLUME_EXTENT,
  });
  const velocitySlicePlane = new SlicePlane(device, {
    texSize: FLUID_TEXTURE_SIZE,
    volumeExtent: FLUID_VOLUME_EXTENT,
  });

  const initialData = createParticleData({
    count: PARTICLE_COUNT,
    radius: MAX_RADIUS,
  });

  const particleBuffers = [
    Buffer.fromData(device, initialData, BufferUsage.storage, "particles-a"),
    Buffer.fromData(device, initialData, BufferUsage.storage, "particles-b"),
  ];

  const { positions } = createPlaneTriangleList(1, 1, 1, "xy");
  const positionBuffer = Buffer.fromData(
    device,
    positions,
    BufferUsage.vertex,
    "particle-quad-positions"
  );
  const mesh = new Mesh(positions.length / 3).addVertexBuffer({
    buffer: positionBuffer,
    arrayStride: 12,
    attributes: [{ shaderLocation: 0, format: "float32x3", offset: 0 }],
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
  const params = {
    advectionScale: 16,
    curl: fluid.settings.CURL,
    densityDissipation: fluid.settings.DENSITY_DISSIPATION,
    velocityDissipation: fluid.settings.VELOCITY_DISSIPATION,
    pressureIterations: fluid.settings.PRESSURE_ITERATIONS,
    showFluidSlice: true,
    showSliceVelocity: true,
    showSliceDensity: true,
  };
  const gui = new GUI({ title: "Fluid Particles" });
  gui
    .add(params, "advectionScale", 1, 64, 1)
    .name("Advection scale")
    .onChange((v: number) => {
      fluid.settings.ADVECTION_SCALE = v;
    });
  gui
    .add(params, "curl", 0, 60, 1)
    .name("Curl (vorticity)")
    .onChange((v: number) => {
      fluid.settings.CURL = v;
    });
  gui
    .add(params, "densityDissipation", 0.9, 1.0, 0.001)
    .name("Density decay")
    .onChange((v: number) => {
      fluid.settings.DENSITY_DISSIPATION = v;
    });
  gui
    .add(params, "velocityDissipation", 0.9, 1.0, 0.001)
    .name("Velocity decay")
    .onChange((v: number) => {
      fluid.settings.VELOCITY_DISSIPATION = v;
    });
  gui
    .add(params, "pressureIterations", 1, 40, 1)
    .name("Pressure iters")
    .onChange((v: number) => {
      fluid.settings.PRESSURE_ITERATIONS = v;
    });
  gui.add(params, "showFluidSlice").name("Show fluid slice");
  gui.add(params, "showSliceVelocity").name("Slice velocity");
  gui.add(params, "showSliceDensity").name("Slice density");

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
      const forceStrength = FLUID_EMITTER.strength * (speed * 500.0);

      fluid.addForce(
        [hit[0], hit[1], hit[2]],
        [d[0], d[1], d[2]],
        FLUID_EMITTER.radius,
        forceStrength,
        1,
        FLUID_EMITTER.noiseStrength
      );
    }
    vec3.copy(lastHit, hit);
  }) as EventListener);

  const lightCamera = new OrthographicCamera(-1, 1, -1, 1, 0.1, 100);
  fitOrthographicCameraToSphere({
    camera: lightCamera,
    center: [0, 0, 0],
    radius: createParticleShadowRadius({
      maxRadius: MAX_RADIUS,
      overshootMultiplier: SIMULATION_OVERSHOOT,
      billboardPadding: SHADOW_PADDING,
    }),
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

  const simParamsBuffer = Buffer.create(
    device,
    32,
    BufferUsage.uniform,
    "sim-params"
  );
  const simParamsData = new ArrayBuffer(32);
  const simParamsF32 = new Float32Array(simParamsData);
  const simParamsU32 = new Uint32Array(simParamsData);
  simParamsF32[2] = MAX_RADIUS * 1.25;
  simParamsU32[3] = PARTICLE_COUNT;
  simParamsF32[4] = 2.8;
  simParamsF32[5] = 0.02;
  simParamsF32[6] = 0.998; //damping
  simParamsF32[7] = 8.4; // centerForce

  const updateCompute = new Compute(device, updateShaderCode, {
    label: "ParticlesUpdate",
    entryPoint: "cs_main",
  });
  const createUpdateBindGroup = (readIndex: number, writeIndex: number) =>
    BindGroup.create(
      device,
      updateCompute.getBindGroupLayout(0),
      [
        { binding: 0, resource: simParamsBuffer },
        { binding: 1, resource: particleBuffers[readIndex] },
        { binding: 2, resource: particleBuffers[writeIndex] },
        { binding: 3, resource: fluid.velocity.view },
        { binding: 4, resource: fluid.density.view },
      ],
      `particles-update-${readIndex}-to-${writeIndex}`
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
    primitive: { topology: "triangle-list", cullMode: "none" },
    depthFormat: "depth32float",
    depthWriteEnabled: true,
    depthCompare: "less",
  });
  const draw = new Draw(device, drawShaderCode, {
    label: "ParticlesDraw",
    layout: drawPipelineLayout,
    vertexBuffers: mesh.getVertexLayouts(),
    primitive: { topology: "triangle-list", cullMode: "none" },
    depthStencil: {
      format: "depth24plus",
      depthWriteEnabled: true,
      depthCompare: "less",
    },
    targets: [{ format: device.format }],
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
    stats.begin();
    device.resize();
    updateAspect();

    const dt = Math.min(1 / 30, Math.max(1 / 240, (now - lastTime) / 1000));
    lastTime = now;
    simParamsF32[0] = now * 0.001;
    simParamsF32[1] = dt;
    simParamsBuffer.write(device, simParamsData);

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
      createUpdateBindGroup(readIndex, writeIndex),
      Math.ceil(PARTICLE_COUNT / WORKGROUP_SIZE)
    );
    computePass.end();

    const shadowPass = shadowMap.beginRenderPass(encoder);
    shadowDraw.draw(
      shadowPass,
      mesh,
      [lightSceneBindGroup, particleDrawBindGroups[writeIndex]],
      PARTICLE_COUNT
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

    stats.end();
    requestAnimationFrame(render);
  };

  window.addEventListener("beforeunload", () => {
    hitTestor.disconnect();
    control.destroy();
    gui.destroy();
    densitySlicePlane.destroy();
    velocitySlicePlane.destroy();
    fluid.destroy();
    depthTexture?.destroy();
    cameraUniformBuffer.destroy();
    lightCameraUniformBuffer.destroy();
    simParamsBuffer.destroy();
    shadowUniformBuffer.destroy();
    shadowMap.destroy();
    positionBuffer.destroy();
    particleBuffers.forEach((buffer) => buffer.destroy());
  });

  requestAnimationFrame(render);
}

main().catch((error) => {
  console.error(error);
});
