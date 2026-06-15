import { COMMON_WGSL } from "./common";

const CURL_NOISE_WGSL = /* wgsl */ `
fn mod289_v4(x: vec4<f32>) -> vec4<f32> {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

fn perm(x: vec4<f32>) -> vec4<f32> {
  return mod289_v4(((x * 34.0) + 1.0) * x);
}

fn noise(p: vec3<f32>) -> f32 {
  let a = floor(p);
  var d = p - a;
  d = d * d * (3.0 - 2.0 * d);

  let b = vec4(a.x, a.x, a.y, a.y) + vec4(0.0, 1.0, 0.0, 1.0);
  let k1 = perm(vec4(b.x, b.y, b.x, b.y));
  let k2 = perm(vec4(k1.x, k1.y, k1.x, k1.y) + vec4(b.z, b.z, b.w, b.w));

  let c = k2 + vec4(a.z, a.z, a.z, a.z);
  let k3 = perm(c);
  let k4 = perm(c + vec4(1.0));

  let o1 = fract(k3 * (1.0 / 41.0));
  let o2 = fract(k4 * (1.0 / 41.0));

  let o3 = o2 * d.z + o1 * (1.0 - d.z);
  let o4 = vec2(o3.y, o3.w) * d.x + vec2(o3.x, o3.z) * (1.0 - d.x);

  return o4.y * d.y + o4.x * (1.0 - d.y);
}

fn snoise(p: vec3<f32>) -> f32 {
  return noise(p) * 2.0 - 1.0;
}

fn snoiseVec3(x: vec3<f32>) -> vec3<f32> {
  let s = snoise(x);
  let s1 = snoise(vec3(x.y - 19.1, x.z + 33.4, x.x + 47.2));
  let s2 = snoise(vec3(x.z + 74.2, x.x - 124.5, x.y + 99.4));
  return vec3(s, s1, s2);
}

fn curlNoise(p: vec3<f32>) -> vec3<f32> {
  let e = 0.1;
  let dx = vec3(e, 0.0, 0.0);
  let dy = vec3(0.0, e, 0.0);
  let dz = vec3(0.0, 0.0, e);

  let p_x0 = snoiseVec3(p - dx);
  let p_x1 = snoiseVec3(p + dx);
  let p_y0 = snoiseVec3(p - dy);
  let p_y1 = snoiseVec3(p + dy);
  let p_z0 = snoiseVec3(p - dz);
  let p_z1 = snoiseVec3(p + dz);

  let x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;
  let y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;
  let z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;

  let divisor = 1.0 / (2.0 * e);
  return normalize(vec3(x, y, z) * divisor);
}
`;

export default /* wgsl */ `
struct SplatParams {
  gridSize: f32,
  time: f32,
  radius: f32,
  strength: f32,
  noiseStrength: f32,
  isVelocity: f32,
  center: vec3<f32>,
  dir: vec3<f32>,
}

@group(0) @binding(0) var<uniform> params: SplatParams;
@group(0) @binding(1) var fieldIn: texture_3d<f32>;
@group(0) @binding(2) var fieldOut: texture_storage_3d<rgba32float, write>;

${COMMON_WGSL}
${CURL_NOISE_WGSL}

@compute @workgroup_size(4, 4, 4)
fn cs_main(@builtin(global_invocation_id) globalId: vec3<u32>) {
  let gridSize = u32(params.gridSize);
  if (globalId.x >= gridSize || globalId.y >= gridSize || globalId.z >= gridSize) {
    return;
  }

  let uvw = (vec3<f32>(globalId) + 0.5) / params.gridSize;
  let base = textureLoad(fieldIn, globalId, 0);

  let noise = curlNoise(vec3<f32>(uvw.x * 2.0, uvw.y * 2.0, uvw.z * 2.0 + params.time)) * params.noiseStrength;
  let dist = distance(uvw, params.center);
  let falloff = smoothstep(params.radius, 0.0, dist);

  var add = vec4(0.0);
  if (params.isVelocity > 0.5) {
    let dir = params.dir * params.strength;
    add = vec4(dir + noise * 0.5, 0.0);
  } else {
    let d = params.strength + noise.x * params.strength;
    add = vec4(d, d, d, 0.0);
  }

  textureStore(fieldOut, globalId, base + add * falloff);
}
`;
