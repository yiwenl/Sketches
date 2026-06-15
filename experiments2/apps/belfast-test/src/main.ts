import {
  assertWebGPUSupport,
  beginRenderPass,
  BindGroup,
  Buffer,
  BufferUsage,
  Compute,
  CopyHelper,
  createPlaneTriangleList,
  createSceneUniformPipelineLayout,
  Device,
  Draw,
  Mesh,
  OrbitalControl,
  PerspectiveCamera,
} from "belfast";
import Stats from "stats.js";
import GUI from "lil-gui";
import drawShaderCode from "./shaders/planes-draw.wgsl?raw";
import distanceShaderCode from "./shaders/planes-distance.wgsl?raw";
import sortShaderCode from "./shaders/bitonic-sort.wgsl?raw";
import { parsePly } from "./ply";
import { createSprayAtlas } from "./sprayTexture";

// ---- Tunables ---------------------------------------------------------------

/** Skip every other splat (keep 1 of N). 2 ≈ halves count and sort cost. */
const STRIDE = 6;
/** Plane size relative to each splat's gaussian radius (this is the "bigger plane" knob). */
const SIZE_MULTIPLIER = 6.0;
/** Clamp plane half-size to a fraction of the model span so nothing blows up / vanishes. */
const MIN_SIZE_FRAC = 0.008;
const MAX_SIZE_FRAC = 0.1;
/** Normalized world span the model is fit into. */
const MODEL_SPAN = 14;
/** Extra alpha gain on top of each splat's opacity (1 = untouched). */
const ALPHA_GAIN = 1.0;

/** Spray sprite atlas grid (cols x rows distinct procedural textures). */
const ATLAS_COLS = 4;
const ATLAS_ROWS = 4;
/** Pixel size of each sprite cell in the atlas. */
const ATLAS_CELL = 256;
/** Re-run GPU sort when the camera moves more than this (world units). */
const CAMERA_SORT_EPS = 1e-4;
/** Bottom-left atlas preview size as a fraction of the shorter canvas side. */
const ATLAS_PREVIEW_FRAC = 0.5;
const ATLAS_PREVIEW_PADDING = 12;

/** Spherical-harmonics DC band constant used to turn f_dc into base color. */
const SH_C0 = 0.28209479177387814;
/** WGSL `Plane`: 3x vec4 (posSize + color + params) = 12 floats / 48 bytes. */
const PLANE_FLOATS = 12;
/** WGSL `Key`: f32 dist + u32 index = 8 bytes. */
const KEY_BYTES = 8;
const WORKGROUP_SIZE = 256;

interface Settings {
  planeScale: number;
  showAtlasPreview: boolean;
}

const settings: Settings = {
  planeScale: 1.5,
  showAtlasPreview: false,
};

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

function clamp(x: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, x));
}

function nextPowerOfTwo(n: number): number {
  let p = 1;
  while (p < n) {
    p <<= 1;
  }
  return p;
}

/** Fixed (k, j) schedule of bitonic merge steps for a power-of-two array. */
function buildBitonicSchedule(count: number): { k: number; j: number }[] {
  const passes: { k: number; j: number }[] = [];
  for (let k = 2; k <= count; k <<= 1) {
    for (let j = k >> 1; j > 0; j >>= 1) {
      passes.push({ k, j });
    }
  }
  return passes;
}

interface ScenePlanes {
  data: Float32Array;
  count: number;
}

/**
 * Load grape.ply and pack it into the WGSL `Plane` layout:
 * posSize (centered + normalized xyz, full size) and color (SH->rgb, opacity->alpha).
 */
async function loadPlanes(
  url: string,
  spriteCount: number
): Promise<ScenePlanes> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to load PLY: ${response.status} ${response.statusText}`
    );
  }
  const buffer = await response.arrayBuffer();

  const { count: total, columns } = parsePly(buffer, [
    "x",
    "y",
    "z",
    "scale_0",
    "scale_1",
    "scale_2",
    "f_dc_0",
    "f_dc_1",
    "f_dc_2",
    "opacity",
  ]);

  const x = columns.x;
  const y = columns.y;
  const z = columns.z;

  // Bounding box -> center + uniform normalization so the cloud fits MODEL_SPAN.
  let minX = Infinity;
  let minY = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxZ = -Infinity;
  for (let i = 0; i < total; i++) {
    minX = Math.min(minX, x[i]);
    minY = Math.min(minY, y[i]);
    minZ = Math.min(minZ, z[i]);
    maxX = Math.max(maxX, x[i]);
    maxY = Math.max(maxY, y[i]);
    maxZ = Math.max(maxZ, z[i]);
  }
  const centerX = (minX + maxX) * 0.5;
  const centerY = (minY + maxY) * 0.5;
  const centerZ = (minZ + maxZ) * 0.5;
  const extent = Math.max(maxX - minX, maxY - minY, maxZ - minZ) || 1;
  const normScale = MODEL_SPAN / extent;
  const minHalf = MODEL_SPAN * MIN_SIZE_FRAC;
  const maxHalf = MODEL_SPAN * MAX_SIZE_FRAC;

  const s0 = columns.scale_0;
  const s1 = columns.scale_1;
  const s2 = columns.scale_2;
  const c0 = columns.f_dc_0;
  const c1 = columns.f_dc_1;
  const c2 = columns.f_dc_2;
  const op = columns.opacity;

  const count = Math.ceil(total / STRIDE);
  const data = new Float32Array(count * PLANE_FLOATS);

  let avgSize = 0;
  let write = 0;
  for (let i = 0; i < total; i += STRIDE) {
    const base = write * PLANE_FLOATS;

    // Position: center the model, flip Y (3DGS/COLMAP exports are Y-down), normalize.
    data[base + 0] = (x[i] - centerX) * normScale;
    data[base + 1] = -(y[i] - centerY) * normScale;
    data[base + 2] = (z[i] - centerZ) * normScale;

    // Size: gaussian scale is stored as log-scale; exp() then normalize + clamp.
    const gaussRadius =
      (Math.exp(s0[i]) + Math.exp(s1[i]) + Math.exp(s2[i])) / 3;
    const half = clamp(
      gaussRadius * normScale * SIZE_MULTIPLIER,
      minHalf,
      maxHalf
    );
    data[base + 3] = half * 2; // full size (shader scales unit quad by this)
    avgSize += half;

    // Color: f_dc is the SH DC term -> base color.
    data[base + 4] = clamp(0.5 + SH_C0 * c0[i], 0, 1);
    data[base + 5] = clamp(0.5 + SH_C0 * c1[i], 0, 1);
    data[base + 6] = clamp(0.5 + SH_C0 * c2[i], 0, 1);

    // Alpha: opacity is stored as a logit.
    data[base + 7] = clamp(sigmoid(op[i]) * ALPHA_GAIN, 0, 1);

    // params.x: random spray sprite index; .yzw reserved.
    data[base + 8] = Math.floor(Math.random() * spriteCount);

    write++;
  }

  console.info(
    `[belfast-test] loaded ${total.toLocaleString()} splats, using ${count.toLocaleString()} planes ` +
      `(stride ${STRIDE}); avg half-size ${(avgSize / count).toFixed(3)} world units.`
  );

  return { data, count };
}

async function main() {
  await assertWebGPUSupport();

  const canvas = document.createElement("canvas");
  canvas.style.cssText = "display:block;width:100vw;height:100vh;";
  document.body.appendChild(canvas);

  const stats = new Stats();
  stats.showPanel(0); // 0 = fps
  stats.dom.style.cssText = "position:fixed;top:0;left:0;z-index:10;";
  document.body.appendChild(stats.dom);

  const device = await Device.create(canvas);

  const atlas = await createSprayAtlas(device, {
    cols: ATLAS_COLS,
    rows: ATLAS_ROWS,
    cell: ATLAS_CELL,
  });

  const { data: planeData, count: INSTANCE_COUNT } = await loadPlanes(
    `${import.meta.env.BASE_URL}grape.ply`,
    atlas.count
  );

  // Bitonic sort needs a power-of-two element count; pad and let the tail sink.
  const SORT_COUNT = nextPowerOfTwo(INSTANCE_COUNT);
  const SORT_WORKGROUPS = Math.ceil(SORT_COUNT / WORKGROUP_SIZE);

  const splatInfo = document.createElement("div");
  splatInfo.textContent = `${INSTANCE_COUNT.toLocaleString()} splats shown · ${SORT_COUNT.toLocaleString()} sorted`;
  splatInfo.style.cssText =
    "position:fixed;bottom:12px;left:50%;transform:translateX(-50%);z-index:10;" +
    "font:12px/1.4 Roboto,sans-serif;color:#ccc;" +
    "pointer-events:none;user-select:none;text-shadow:0 1px 2px rgba(0,0,0,0.8);";
  document.body.appendChild(splatInfo);

  // Unit quad expanded to camera-facing billboards in the shader.
  const { positions } = createPlaneTriangleList(1, 1, 1, "xy");
  const vertexCount = positions.length / 3;
  const positionBuffer = Buffer.fromData(
    device,
    positions,
    BufferUsage.vertex,
    "plane-positions"
  );

  const planeBuffer = Buffer.fromData(
    device,
    planeData,
    BufferUsage.storage,
    "plane-instance-data"
  );
  const keysBuffer = Buffer.create(
    device,
    SORT_COUNT * KEY_BYTES,
    BufferUsage.storage,
    "sort-keys"
  );

  const mesh = new Mesh(vertexCount).addVertexBuffer({
    buffer: positionBuffer,
    arrayStride: 12,
    attributes: [{ shaderLocation: 0, format: "float32x3", offset: 0 }],
    slot: 0,
    stepMode: "vertex",
  });

  // Camera / scene uniforms: viewProj + camera right/up basis (for billboarding).
  const uniformBuffer = Buffer.create(
    device,
    Buffer.uniformSize(PerspectiveCamera.uniformByteSize()),
    BufferUsage.uniform,
    "camera-uniforms"
  );
  const cameraUniformData = new Float32Array(
    PerspectiveCamera.uniformFloatCount
  );

  const RAD = Math.PI / 180;
  const camera = new PerspectiveCamera(50 * RAD, 1, 0.1, 200);
  const control = new OrbitalControl(camera, {
    listenerTarget: canvas,
    center: [0, 0, 0],
    radius: MODEL_SPAN * 1.4,
  });

  // ---- Compute: distance seeding + bitonic sort -----------------------------

  // DistParams: vec4 cameraPos + (count, total, pad, pad) = 32 bytes.
  const distParamsBuffer = Buffer.create(
    device,
    32,
    BufferUsage.uniform,
    "distance-params"
  );
  const distParamsData = new ArrayBuffer(32);
  const distParamsF32 = new Float32Array(distParamsData, 0, 4);
  const distParamsU32 = new Uint32Array(distParamsData, 16, 4);
  distParamsU32[0] = INSTANCE_COUNT;
  distParamsU32[1] = SORT_COUNT;

  const distanceCompute = new Compute(device, distanceShaderCode, {
    label: "PlaneDistance",
    entryPoint: "cs_main",
  });
  const distanceBindGroup = BindGroup.create(
    device,
    distanceCompute.getBindGroupLayout(0),
    [
      { binding: 0, resource: distParamsBuffer },
      { binding: 1, resource: planeBuffer },
      { binding: 2, resource: keysBuffer },
    ],
    "distance-bind-group"
  );

  const sortCompute = new Compute(device, sortShaderCode, {
    label: "BitonicSort",
    entryPoint: "cs_main",
  });

  // Each (k, j) step is constant across frames, so build its uniform + bind group once.
  const schedule = buildBitonicSchedule(SORT_COUNT);
  const sortBindGroups = schedule.map(({ k, j }, index) => {
    const paramsBuffer = Buffer.create(
      device,
      16,
      BufferUsage.uniform,
      `sort-params-${index}`
    );
    paramsBuffer.write(device, new Uint32Array([j, k, SORT_COUNT, 0]));
    return BindGroup.create(
      device,
      sortCompute.getBindGroupLayout(0),
      [
        { binding: 0, resource: paramsBuffer },
        { binding: 1, resource: keysBuffer },
      ],
      `sort-bind-group-${index}`
    );
  });

  // ---- Render ---------------------------------------------------------------

  const scene = createSceneUniformPipelineLayout(device, "GrapePlanesScene");

  const storageBindGroupLayout = device.gpu.createBindGroupLayout({
    label: "PlanesStorageLayout",
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.VERTEX,
        buffer: { type: "read-only-storage" },
      },
      {
        binding: 1,
        visibility: GPUShaderStage.VERTEX,
        buffer: { type: "read-only-storage" },
      },
    ],
  });
  const atlasBindGroupLayout = device.gpu.createBindGroupLayout({
    label: "SprayAtlasLayout",
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        buffer: { type: "uniform" },
      },
      {
        binding: 1,
        visibility: GPUShaderStage.FRAGMENT,
        texture: { sampleType: "float" },
      },
    ],
  });
  const planesPipelineLayout = device.gpu.createPipelineLayout({
    label: "PlanesPipelineLayout",
    bindGroupLayouts: [
      scene.bindGroupLayout,
      storageBindGroupLayout,
      atlasBindGroupLayout,
    ],
  });

  const atlasInfoBuffer = Buffer.create(
    device,
    16,
    BufferUsage.uniform,
    "atlas-info"
  );
  const atlasInfoData = new Float32Array([
    atlas.cols,
    atlas.rows,
    settings.planeScale,
    0,
  ]);
  atlasInfoBuffer.write(device, atlasInfoData);

  const gui = new GUI({ title: "Belfast Test" });
  gui.add(settings, "planeScale", 0.1, 8, 0.05).name("Plane Scale");
  gui.add(settings, "showAtlasPreview").name("Show Spray Atlas");

  const atlasCopy = new CopyHelper(device, { label: "SprayAtlasPreview" });

  const draw = new Draw(device, drawShaderCode, {
    label: "GrapePlanes",
    layout: planesPipelineLayout,
    vertexBuffers: mesh.getVertexLayouts(),
    primitive: { topology: "triangle-list", cullMode: "none" },
    depthStencil: {
      format: "depth24plus",
      depthWriteEnabled: false,
      depthCompare: "less",
    },
    targets: [
      {
        format: device.format,
        blend: {
          color: {
            srcFactor: "src-alpha",
            dstFactor: "one-minus-src-alpha",
            operation: "add",
          },
          alpha: {
            srcFactor: "one",
            dstFactor: "one-minus-src-alpha",
            operation: "add",
          },
        },
      },
    ],
  });

  const sceneBindGroup = BindGroup.create(
    device,
    scene.bindGroupLayout,
    uniformBuffer,
    0,
    "scene-bind-group"
  );
  const atlasBindGroup = BindGroup.create(
    device,
    atlasBindGroupLayout,
    [
      { binding: 0, resource: atlasInfoBuffer },
      { binding: 1, resource: atlas.texture.view },
    ],
    "spray-atlas-bind-group"
  );
  const storageBindGroup = BindGroup.create(
    device,
    storageBindGroupLayout,
    [
      { binding: 0, resource: planeBuffer },
      { binding: 1, resource: keysBuffer },
    ],
    "planes-storage-bind-group"
  );

  window.addEventListener("beforeunload", () => {
    control.destroy();
    positionBuffer.destroy();
    planeBuffer.destroy();
    keysBuffer.destroy();
    uniformBuffer.destroy();
    distParamsBuffer.destroy();
    atlasInfoBuffer.destroy();
    atlas.texture.destroy();
  });

  let depthTexture: GPUTexture | null = null;
  let lastWidth = 0;
  let lastHeight = 0;
  let lastSortCameraPos: [number, number, number] | null = null;

  const cameraNeedsSort = (x: number, y: number, z: number): boolean => {
    if (!lastSortCameraPos) {
      return true;
    }
    const dx = x - lastSortCameraPos[0];
    const dy = y - lastSortCameraPos[1];
    const dz = z - lastSortCameraPos[2];
    const epsSq = CAMERA_SORT_EPS * CAMERA_SORT_EPS;
    return dx * dx + dy * dy + dz * dz > epsSq;
  };

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
    const nextDepthTexture = device.gpu.createTexture({
      label: "depth-texture",
      size: [width, height],
      format: "depth24plus",
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
    depthTexture = nextDepthTexture;
    return nextDepthTexture.createView();
  };

  const render = () => {
    stats.begin();
    device.resize();
    updateAspect();

    camera.writeUniformData(cameraUniformData);
    uniformBuffer.write(device, cameraUniformData);

    atlasInfoData[2] = settings.planeScale;
    atlasInfoBuffer.write(device, atlasInfoData);

    const cameraPos = camera.getPosition();
    const needsSort = cameraNeedsSort(cameraPos[0], cameraPos[1], cameraPos[2]);

    if (needsSort) {
      distParamsF32[0] = cameraPos[0];
      distParamsF32[1] = cameraPos[1];
      distParamsF32[2] = cameraPos[2];
      distParamsBuffer.write(device, distParamsData);
    }

    const colorView = device.getCurrentTexture().createView();
    const depthView = ensureDepthTexture();
    const encoder = device.gpu.createCommandEncoder({ label: "grape-frame" });

    if (needsSort) {
      const computePass = encoder.beginComputePass({ label: "sort-planes" });
      distanceCompute.dispatch(computePass, distanceBindGroup, SORT_WORKGROUPS);
      for (const bindGroup of sortBindGroups) {
        sortCompute.dispatch(computePass, bindGroup, SORT_WORKGROUPS);
      }
      computePass.end();
      lastSortCameraPos = [cameraPos[0], cameraPos[1], cameraPos[2]];
    }

    const pass = beginRenderPass(encoder, colorView, {
      clearColor: { r: 0.04, g: 0.04, b: 0.05, a: 1 },
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
      [sceneBindGroup, storageBindGroup, atlasBindGroup],
      INSTANCE_COUNT
    );

    pass.end();

    if (settings.showAtlasPreview) {
      const previewSize = Math.floor(
        Math.min(canvas.width, canvas.height) * ATLAS_PREVIEW_FRAC
      );
      const previewPass = beginRenderPass(encoder, colorView, {
        loadOp: "load",
      });
      atlasCopy.draw(previewPass, atlas.texture.view, atlas.texture.sampler, {
        x: ATLAS_PREVIEW_PADDING,
        y: Math.max(0, canvas.height - previewSize - ATLAS_PREVIEW_PADDING),
        width: previewSize,
        height: previewSize,
      });
      previewPass.end();
    }

    device.gpu.queue.submit([encoder.finish()]);

    stats.end();
    requestAnimationFrame(render);
  };

  render();
}

main().catch((error) => {
  console.error(error);
});
