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
  Mesh,
  OrbitalControl,
  OrthographicCamera,
  PerspectiveCamera,
  ShadowMap,
  wgslShadowPcf3x3,
} from "belfast";
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
const SHADOW_MAP_SIZE = 1024;
const SIMULATION_OVERSHOOT = 1.35;
const SHADOW_PADDING = 0.75;
const SHADOW_STRENGTH = 0.65;
const SHADOW_BIAS = 0.002;
const LIGHT_POSITION: [number, number, number] = [2, 18, 0.5];
const LIGHT_UP: [number, number, number] = [0, 0, -1];
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
  label.textContent = `${PARTICLE_COUNT.toLocaleString()} particles`;
  label.style.cssText =
    "position:fixed;right:14px;bottom:12px;z-index:10;color:#d8d8d8;" +
    "font:12px/1.45 ui-sans-serif,system-ui,sans-serif;" +
    "letter-spacing:0;text-shadow:0 1px 2px rgba(0,0,0,0.7);" +
    "pointer-events:none;user-select:none;";
  document.body.appendChild(label);

  const device = await Device.create(canvas);
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

  const simParamsBuffer = Buffer.create(
    device,
    32,
    BufferUsage.uniform,
    "sim-params"
  );
  const simParamsData = new ArrayBuffer(32);
  const simParamsF32 = new Float32Array(simParamsData);
  const simParamsU32 = new Uint32Array(simParamsData);
  simParamsF32[2] = MAX_RADIUS;
  simParamsU32[3] = PARTICLE_COUNT;
  simParamsF32[4] = 0.22;
  simParamsF32[5] = 7.2;
  simParamsF32[6] = 0.992;
  simParamsF32[7] = 5.4;

  const updateCompute = new Compute(device, updateShaderCode, {
    label: "ParticlesUpdate",
    entryPoint: "cs_main",
  });
  const updateBindGroups = [
    BindGroup.create(
      device,
      updateCompute.getBindGroupLayout(0),
      [
        { binding: 0, resource: simParamsBuffer },
        { binding: 1, resource: particleBuffers[0] },
        { binding: 2, resource: particleBuffers[1] },
      ],
      "particles-update-a-to-b"
    ),
    BindGroup.create(
      device,
      updateCompute.getBindGroupLayout(0),
      [
        { binding: 0, resource: simParamsBuffer },
        { binding: 1, resource: particleBuffers[1] },
        { binding: 2, resource: particleBuffers[0] },
      ],
      "particles-update-b-to-a"
    ),
  ];

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
      label: "particles-frame",
    });

    const computePass = encoder.beginComputePass({ label: "update-particles" });
    updateCompute.dispatch(
      computePass,
      updateBindGroups[readIndex],
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
      clearColor: { r: 0.015, g: 0.015, b: 0.017, a: 1 },
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

    device.gpu.queue.submit([encoder.finish()]);
    readIndex = writeIndex;

    stats.end();
    requestAnimationFrame(render);
  };

  window.addEventListener("beforeunload", () => {
    control.destroy();
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
