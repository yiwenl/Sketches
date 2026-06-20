export default /* wgsl */ `
struct ForceParams {
  grid: vec4<f32>, // x: gridSize, y: time
  center: vec4<f32>,
  dir: vec4<f32>, // w: noiseStrength
  force: vec4<f32>, // x: dt, y: strength, z: radius, w: densityScale
}

@group(0) @binding(0) var<uniform> params: ForceParams;
@group(0) @binding(1) var velocityIn: texture_2d<f32>;
@group(0) @binding(2) var densityIn: texture_2d<f32>;
@group(0) @binding(3) var velocityOut: texture_storage_2d<rgba32float, write>;
@group(0) @binding(4) var densityOut: texture_storage_2d<rgba32float, write>;

// Optional noise helpers
fn mod289(x: vec2<f32>) -> vec2<f32> { return x - floor(x * (1.0 / 289.0)) * 289.0; }
fn mod289_3(x: vec3<f32>) -> vec3<f32> { return x - floor(x * (1.0 / 289.0)) * 289.0; }
fn permute3(x: vec3<f32>) -> vec3<f32> { return mod289_3(((x * 34.0) + 1.0) * x); }

fn snoise(v: vec2<f32>) -> f32 {
  let C = vec4<f32>(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  var i  = floor(v + dot(v, C.yy));
  var x0 = v -   i + dot(i, C.xx);
  var i1 = select(vec2<f32>(0.0, 1.0), vec2<f32>(1.0, 0.0), x0.x > x0.y);
  var x1 = x0 + C.xx - i1;
  var x2 = x0 + C.zz;
  i = mod289(i);
  var p = permute3(permute3(i.y + vec3<f32>(0.0, i1.y, 1.0)) + i.x + vec3<f32>(0.0, i1.x, 1.0));
  var m = max(0.5 - vec3<f32>(dot(x0, x0), dot(x1, x1), dot(x2, x2)), vec3<f32>(0.0));
  m = m * m;
  m = m * m;
  var x = 2.0 * fract(p * C.www) - 1.0;
  var h = abs(x) - 0.5;
  var ox = floor(x + 0.5);
  var a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  var g = vec3<f32>(
    a0.x * x0.x + h.x * x0.y,
    a0.yz * vec2<f32>(x1.x, x2.x) + h.yz * vec2<f32>(x1.y, x2.y)
  );
  return 130.0 * dot(m, g);
}

fn curlNoise(p: vec2<f32>) -> vec2<f32> {
  let e = 0.01;
  let dx = vec2(e, 0.0);
  let dy = vec2(0.0, e);
  let x = snoise(p + dy) - snoise(p - dy);
  let y = -(snoise(p + dx) - snoise(p - dx));
  let divisor = 1.0 / (2.0 * e);
  return normalize(vec2(x, y) * divisor);
}

@compute @workgroup_size(4, 4, 1)
fn cs_main(@builtin(global_invocation_id) globalId: vec3<u32>) {
  let gridSize = u32(params.grid.x);
  if (globalId.x >= gridSize || globalId.y >= gridSize) {
    return;
  }

  let uv = (vec2<f32>(globalId.xy) + 0.5) / params.grid.x;
  let pos = uv - vec2(0.5);
  
  let d = pos - params.center.xy;
  let r = params.force.z;
  
  var strength = exp(-dot(d, d) / r) * params.force.x * params.force.y;
  
  var dir = params.dir.xy;
  if (params.dir.w > 0.0) {
    let noise = curlNoise(pos * 5.0 + vec2(0.0, params.grid.y * 0.3)) * params.dir.w;
    dir = normalize(dir + noise);
  }

  let c = vec2<i32>(globalId.xy);
  let vel = textureLoad(velocityIn, c, 0).xy;
  textureStore(velocityOut, c, vec4(vel + dir * strength, 0.0, 0.0));

  let den = textureLoad(densityIn, c, 0).x;
  let addedDensity = strength * params.force.w;
  textureStore(densityOut, c, vec4(den + addedDensity, 0.0, 0.0, 0.0));
}
`;
