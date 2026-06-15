// Procedurally generated ink-spray sprite atlas.
//
// Each cell is either a stipple spray or (for 2 slots) a solid noise-deformed disc.
// UV warping breaks the circular silhouette on both variants.
// The plane shader reads inverted red (1 - r) as coverage.

import { Device, Texture } from "belfast";

export interface SprayAtlas {
  texture: Texture;
  cols: number;
  rows: number;
  count: number;
}

export interface SprayAtlasOptions {
  /** Atlas grid columns (default 4). */
  cols?: number;
  /** Atlas grid rows (default 4). */
  rows?: number;
  /** Pixel size of each sprite cell (default 128). */
  cell?: number;
}

/** Atlas cell indices that use a solid noise-deformed disc instead of stipple spray. */
const SOLID_CIRCLE_INDICES = [3, 5, 12, 14];

/** Per-cell UV warp — breaks the circular silhouette. */
interface CellWarp {
  seed: number;
  /** Noise displacement in normalised cell UV space. */
  strength: number;
}

function randRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/** Deterministic hash -> [0, 1). */
function hash01(x: number, y: number, seed: number): number {
  let h = (x * 374761393 + y * 668265263 + seed * 982451653) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Deterministic hash -> [-1, 1). */
function hash11(x: number, y: number, seed: number): number {
  return hash01(x, y, seed) * 2 - 1;
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

/** Smooth value noise on a 2D grid. */
function smoothNoise(x: number, y: number, seed: number): number {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = smoothstep(x - x0);
  const fy = smoothstep(y - y0);
  const n00 = hash11(x0, y0, seed);
  const n10 = hash11(x0 + 1, y0, seed);
  const n01 = hash11(x0, y0 + 1, seed);
  const n11 = hash11(x0 + 1, y0 + 1, seed);
  const nx0 = n00 + (n10 - n00) * fx;
  const nx1 = n01 + (n11 - n01) * fx;
  return nx0 + (nx1 - nx0) * fy;
}

/** Displace normalised cell UV with layered smooth noise. */
function warpUv(
  u: number,
  v: number,
  warp: CellWarp
): { u: number; v: number } {
  const { seed, strength } = warp;
  const n0 = smoothNoise(u * 2.4 + 0.3, v * 2.4 + 0.7, seed);
  const n1 = smoothNoise(u * 5.1 + 1.9, v * 5.1 + 2.3, seed + 137);
  const n2 = smoothNoise(u * 9.7 + 4.1, v * 9.7 + 3.7, seed + 389);
  return {
    u: u + (n0 * 0.55 + n1 * 0.3 + n2 * 0.15) * strength,
    v:
      v +
      (smoothNoise(u * 2.4 + 2.1, v * 2.4 + 5.3, seed + 71) * 0.55 +
        smoothNoise(u * 5.1 + 3.7, v * 5.1 + 1.1, seed + 211) * 0.3 +
        smoothNoise(u * 9.7 + 6.3, v * 9.7 + 8.9, seed + 503) * 0.15) *
        strength,
  };
}

/** Normalised radial distance after UV warp (1 = nominal edge). */
function warpedDist(u: number, v: number, warp: CellWarp): number {
  const p = warpUv(u, v, warp);
  return Math.sqrt(p.u * p.u + p.v * p.v);
}

function createCellWarp(seed: number, forSolid = false): CellWarp {
  return {
    seed,
    strength: forSolid ? randRange(0.18, 0.38) : randRange(0.14, 0.32),
  };
}

/** Map warped normalised UV to canvas pixel coordinates. */
function uvToPixel(
  u: number,
  v: number,
  cx: number,
  cy: number,
  maxR: number,
  warp: CellWarp
): { x: number; y: number } {
  const p = warpUv(u, v, warp);
  return { x: cx + p.u * maxR, y: cy + p.v * maxR };
}

/** Coarse stipple splatter — clustered dots with occasional larger blobs. */
function drawCoarseSpray(
  ctx: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  size: number,
  warp: CellWarp
): void {
  const cx = ox + size * 0.5;
  const cy = oy + size * 0.5;
  const maxR = size * 0.46;
  const densityScale = (size / 256) ** 2;
  const dotCount = Math.floor(randRange(2200, 4200) * densityScale);
  const clustering = randRange(0.6, 1.4);
  const rimFade = randRange(0.7, 1.1);
  const jitter = 0.015;

  ctx.save();
  ctx.fillStyle = "#000";

  for (let i = 0; i < dotCount; i++) {
    const t = Math.pow(Math.random(), clustering);
    const edge = t;
    if (Math.random() < edge * edge * rimFade) {
      continue;
    }

    const ang = Math.random() * Math.PI * 2;
    const u = Math.cos(ang) * t;
    const v = Math.sin(ang) * t;
    if (warpedDist(u, v, warp) > 1.02) {
      continue;
    }

    const { x, y } = uvToPixel(
      u + randRange(-jitter, jitter),
      v + randRange(-jitter, jitter),
      cx,
      cy,
      maxR,
      warp
    );

    let dotRadius = randRange(0.4, 1.6);
    if (Math.random() < 0.025) {
      dotRadius = randRange(2, 5.5);
    }

    const alpha = (1 - edge * 0.65) * randRange(0.45, 1);
    ctx.globalAlpha = Math.min(1, alpha);
    ctx.beginPath();
    ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/** Fine stipple grain — many tiny dots spread across the warped shape. */
function drawFineNoise(
  ctx: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  size: number,
  warp: CellWarp
): void {
  const cx = ox + size * 0.5;
  const cy = oy + size * 0.5;
  const maxR = size * 0.47;
  const densityScale = (size / 256) ** 2;
  const dotCount = Math.floor(randRange(9000, 16000) * densityScale);

  ctx.save();
  ctx.fillStyle = "#000";

  for (let i = 0; i < dotCount; i++) {
    const ang = Math.random() * Math.PI * 2;
    const t = Math.sqrt(Math.random());
    const u = Math.cos(ang) * t;
    const v = Math.sin(ang) * t;
    if (warpedDist(u, v, warp) > 1.02) {
      continue;
    }

    const { x, y } = uvToPixel(u, v, cx, cy, maxR, warp);

    ctx.globalAlpha = randRange(0.12, 0.5);
    ctx.beginPath();
    ctx.arc(x, y, randRange(0.12, 0.42), 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Multiply coverage by warped radial falloff and add per-pixel fine grain.
 * Encodes result as greyscale (white = empty, black = full coverage).
 */
function applyFalloffAndFineGrain(
  ctx: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  size: number,
  warp: CellWarp
): void {
  const imageData = ctx.getImageData(ox, oy, size, size);
  const data = imageData.data;
  const cx = size * 0.5;
  const cy = size * 0.5;
  const maxR = size * 0.48;
  const falloffPower = randRange(1.4, 2.2);
  const { seed } = warp;

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const i = (py * size + px) * 4;

      const u = (px + 0.5 - cx) / maxR;
      const v = (py + 0.5 - cy) / maxR;
      const dist = warpedDist(u, v, warp);
      const falloff = dist >= 1 ? 0 : Math.pow(1 - dist, falloffPower);

      let coverage = 1 - data[i] / 255;

      const grain = hash01(px, py, seed);
      if (grain > 0.58) {
        coverage = Math.min(1, coverage + (grain - 0.58) * 1.35);
      }

      coverage = Math.min(1, coverage * falloff);

      const value = Math.floor((1 - coverage) * 255);
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
      data[i + 3] = 255;
    }
  }

  ctx.putImageData(imageData, ox, oy);
}

/** Draw one complete spray cell. */
function drawSprayCell(
  ctx: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  size: number,
  seed: number
): void {
  const warp = createCellWarp(seed);
  ctx.fillStyle = "#fff";
  ctx.fillRect(ox, oy, size, size);
  drawCoarseSpray(ctx, ox, oy, size, warp);
  drawFineNoise(ctx, ox, oy, size, warp);
  applyFalloffAndFineGrain(ctx, ox, oy, size, warp);
}

/**
 * Solid disc with noise-deformed silhouette — softer edge band, light surface grain.
 * Same coverage encoding as stipple spray (white = empty, black = full).
 */
function drawSolidCircleCell(
  ctx: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  size: number,
  seed: number
): void {
  const warp = createCellWarp(seed, true);
  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;
  const cx = size * 0.5;
  const cy = size * 0.5;
  const maxR = size * 0.46 * 0.75; // 25% smaller than the stipple spray radius
  const edgeBand = randRange(0.1, 0.18);

  ctx.fillStyle = "#fff";
  ctx.fillRect(ox, oy, size, size);

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const i = (py * size + px) * 4;
      const u = (px + 0.5 - cx) / maxR;
      const v = (py + 0.5 - cy) / maxR;
      const dist = warpedDist(u, v, warp);

      let coverage = 0;
      if (dist < 1 - edgeBand) {
        coverage = 1;
      } else if (dist < 1) {
        const t = (1 - dist) / edgeBand;
        coverage = t * t * (3 - 2 * t);
      }

      const grain = hash01(px, py, seed);
      if (grain > 0.72) {
        coverage = Math.min(1, coverage + (grain - 0.72) * 0.6);
      }

      const value = Math.floor((1 - coverage) * 255);
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
      data[i + 3] = 255;
    }
  }

  ctx.putImageData(imageData, ox, oy);
}

/** Build the atlas canvas and upload it as a Belfast {@link Texture}. */
export async function createSprayAtlas(
  device: Device,
  options: SprayAtlasOptions = {}
): Promise<SprayAtlas> {
  const cols = options.cols ?? 4;
  const rows = options.rows ?? 4;
  const cell = options.cell ?? 128;
  const count = cols * rows;

  const canvas = document.createElement("canvas");
  canvas.width = cols * cell;
  canvas.height = rows * cell;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get 2D context for spray atlas");
  }

  for (let i = 0; i < count; i++) {
    const ox = (i % cols) * cell;
    const oy = Math.floor(i / cols) * cell;
    const seed = i * 7919 + 1;
    if (SOLID_CIRCLE_INDICES.includes(i)) {
      drawSolidCircleCell(ctx, ox, oy, cell, seed);
    } else {
      drawSprayCell(ctx, ox, oy, cell, seed);
    }
  }

  const bitmap = await createImageBitmap(canvas);
  const texture = Texture.fromBitmap(device, bitmap, {
    label: "spray-atlas",
    flipY: false,
    addressModeU: "clamp-to-edge",
    addressModeV: "clamp-to-edge",
    magFilter: "nearest",
    minFilter: "nearest",
  });
  bitmap.close();

  return { texture, cols, rows, count };
}
