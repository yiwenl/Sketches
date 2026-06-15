/** Shared WGSL helpers for 3D fluid passes. */
export const COMMON_WGSL = /* wgsl */ `
fn mirrorRepeat01(t: f32) -> f32 {
  var x = abs(t);
  let period = 2.0;
  x = x - floor(x / period) * period;
  if (x > 1.0) {
    x = 2.0 - x;
  }
  return x;
}

fn mirrorRepeat3(c: vec3<f32>) -> vec3<f32> {
  return vec3(mirrorRepeat01(c.x), mirrorRepeat01(c.y), mirrorRepeat01(c.z));
}

fn sampleScalarMirrored(tex: texture_3d<f32>, uvw: vec3<f32>, gridSize: f32) -> f32 {
  let gs = gridSize;
  let m = mirrorRepeat3(uvw);
  let coord = vec3<i32>(clamp(m * gs, vec3(0.0), vec3(gs - 1.0)));
  return textureLoad(tex, coord, 0).x;
}

fn sampleVec3Mirrored(tex: texture_3d<f32>, uvw: vec3<f32>, gridSize: f32) -> vec3<f32> {
  let gs = gridSize;
  let m = mirrorRepeat3(uvw);
  let coord = vec3<i32>(clamp(m * gs, vec3(0.0), vec3(gs - 1.0)));
  return textureLoad(tex, coord, 0).xyz;
}

fn sampleScalarOffset(tex: texture_3d<f32>, coord: vec3<i32>, gridSize: f32) -> f32 {
  let n = i32(gridSize);
  let cx = clamp(coord.x, 0, n - 1);
  let cy = clamp(coord.y, 0, n - 1);
  let cz = clamp(coord.z, 0, n - 1);
  return textureLoad(tex, vec3<i32>(cx, cy, cz), 0).x;
}

fn sampleVec3Offset(tex: texture_3d<f32>, coord: vec3<i32>, gridSize: f32) -> vec3<f32> {
  let n = i32(gridSize);
  let cx = clamp(coord.x, 0, n - 1);
  let cy = clamp(coord.y, 0, n - 1);
  let cz = clamp(coord.z, 0, n - 1);
  return textureLoad(tex, vec3<i32>(cx, cy, cz), 0).xyz;
}

fn sampleVelocityMirrored(tex: texture_3d<f32>, uvw: vec3<f32>, gridSize: f32) -> vec3<f32> {
  let gs = gridSize;
  let mult = vec3<f32>(
    select(1.0, -1.0, uvw.x < 0.0 || uvw.x > 1.0),
    select(1.0, -1.0, uvw.y < 0.0 || uvw.y > 1.0),
    select(1.0, -1.0, uvw.z < 0.0 || uvw.z > 1.0),
  );
  let u = mirrorRepeat3(uvw);
  let coord = vec3<i32>(clamp(u * gs, vec3(0.0), vec3(gs - 1.0)));
  return textureLoad(tex, coord, 0).xyz * mult;
}

// ── Trilinear interpolation for smooth advection ──────────────────
fn sampleTrilinear(tex: texture_3d<f32>, uvw: vec3<f32>, gridSize: f32) -> vec4<f32> {
  let m = mirrorRepeat3(uvw);
  let tc = m * gridSize - 0.5;         // continuous texel coords
  let t0 = floor(tc);
  let f  = tc - t0;                     // fractional part [0,1)

  let gs = i32(gridSize);
  let i0 = vec3<i32>(t0);
  let i1 = i0 + 1;
  // clamp to valid range
  let c0 = clamp(i0, vec3(0), vec3(gs - 1));
  let c1 = clamp(i1, vec3(0), vec3(gs - 1));

  // 8-tap load
  let v000 = textureLoad(tex, vec3<i32>(c0.x, c0.y, c0.z), 0);
  let v100 = textureLoad(tex, vec3<i32>(c1.x, c0.y, c0.z), 0);
  let v010 = textureLoad(tex, vec3<i32>(c0.x, c1.y, c0.z), 0);
  let v110 = textureLoad(tex, vec3<i32>(c1.x, c1.y, c0.z), 0);
  let v001 = textureLoad(tex, vec3<i32>(c0.x, c0.y, c1.z), 0);
  let v101 = textureLoad(tex, vec3<i32>(c1.x, c0.y, c1.z), 0);
  let v011 = textureLoad(tex, vec3<i32>(c0.x, c1.y, c1.z), 0);
  let v111 = textureLoad(tex, vec3<i32>(c1.x, c1.y, c1.z), 0);

  // lerp along x, then y, then z
  let a00 = mix(v000, v100, f.x);
  let a10 = mix(v010, v110, f.x);
  let a01 = mix(v001, v101, f.x);
  let a11 = mix(v011, v111, f.x);
  let b0  = mix(a00,  a10,  f.y);
  let b1  = mix(a01,  a11,  f.y);
  return mix(b0, b1, f.z);
}

fn sampleScalarTrilinear(tex: texture_3d<f32>, uvw: vec3<f32>, gridSize: f32) -> f32 {
  return sampleTrilinear(tex, uvw, gridSize).x;
}
`;
