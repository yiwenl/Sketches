struct Particle {
  posSize: vec4<f32>,
  velocity: vec4<f32>,
  color: vec4<f32>,
}

struct SimParams {
  time: f32,
  dt: f32,
  maxRadius: f32,
  count: u32,
  noiseScale: f32,
  forceScale: f32,
  damping: f32,
  centerForce: f32,
}

@group(0) @binding(0) var<uniform> params: SimParams;
@group(0) @binding(1) var<storage, read> particlesIn: array<Particle>;
@group(0) @binding(2) var<storage, read_write> particlesOut: array<Particle>;

fn hash31(p: vec3<f32>) -> f32 {
  let h = dot(p, vec3<f32>(127.1, 311.7, 74.7));
  return fract(sin(h) * 43758.5453123);
}

fn valueNoise(p: vec3<f32>) -> f32 {
  let i = floor(p);
  let f = fract(p);
  let u = f * f * (3.0 - 2.0 * f);

  let n000 = hash31(i + vec3<f32>(0.0, 0.0, 0.0));
  let n100 = hash31(i + vec3<f32>(1.0, 0.0, 0.0));
  let n010 = hash31(i + vec3<f32>(0.0, 1.0, 0.0));
  let n110 = hash31(i + vec3<f32>(1.0, 1.0, 0.0));
  let n001 = hash31(i + vec3<f32>(0.0, 0.0, 1.0));
  let n101 = hash31(i + vec3<f32>(1.0, 0.0, 1.0));
  let n011 = hash31(i + vec3<f32>(0.0, 1.0, 1.0));
  let n111 = hash31(i + vec3<f32>(1.0, 1.0, 1.0));

  let nx00 = mix(n000, n100, u.x);
  let nx10 = mix(n010, n110, u.x);
  let nx01 = mix(n001, n101, u.x);
  let nx11 = mix(n011, n111, u.x);
  let nxy0 = mix(nx00, nx10, u.y);
  let nxy1 = mix(nx01, nx11, u.y);
  return mix(nxy0, nxy1, u.z) * 2.0 - 1.0;
}

fn noiseVec(p: vec3<f32>) -> vec3<f32> {
  return vec3<f32>(
    valueNoise(p + vec3<f32>(13.5, 41.2, 7.1)),
    valueNoise(p + vec3<f32>(29.7, 5.3, 83.6)),
    valueNoise(p + vec3<f32>(61.1, 17.8, 19.4)),
  );
}

fn curlNoise(p: vec3<f32>) -> vec3<f32> {
  let e = 0.12;
  let dx = vec3<f32>(e, 0.0, 0.0);
  let dy = vec3<f32>(0.0, e, 0.0);
  let dz = vec3<f32>(0.0, 0.0, e);

  let pY0 = noiseVec(p - dy);
  let pY1 = noiseVec(p + dy);
  let pZ0 = noiseVec(p - dz);
  let pZ1 = noiseVec(p + dz);
  let pX0 = noiseVec(p - dx);
  let pX1 = noiseVec(p + dx);

  let x = pY1.z - pY0.z - pZ1.y + pZ0.y;
  let y = pZ1.x - pZ0.x - pX1.z + pX0.z;
  let z = pX1.y - pX0.y - pY1.x + pY0.x;
  return normalize(vec3<f32>(x, y, z) / (2.0 * e));
}

@compute @workgroup_size(256)
fn cs_main(@builtin(global_invocation_id) globalId: vec3<u32>) {
  let i = globalId.x;
  if (i >= params.count) {
    return;
  }

  let particle = particlesIn[i];
  var pos = particle.posSize.xyz;
  var vel = particle.velocity.xyz;

  let timeOffset = vec3<f32>(
    params.time * 0.16,
    params.time * 0.11,
    params.time * 0.13,
  );
  let noisePosition = (pos + timeOffset) * params.noiseScale;
  var force = curlNoise(noisePosition) * params.forceScale;

  let dist = length(pos);
  if (dist > params.maxRadius) {
    let overflow = dist - params.maxRadius;
    force += -normalize(pos) * overflow * params.centerForce;
  }

  vel = (vel + force * params.dt) * params.damping;
  pos = pos + vel * params.dt;

  let nextDist = length(pos);
  if (nextDist > params.maxRadius * 1.35) {
    pos = normalize(pos) * params.maxRadius;
    vel = vel * 0.25;
  }

  particlesOut[i] = Particle(
    vec4<f32>(pos, particle.posSize.w),
    vec4<f32>(vel, particle.velocity.w),
    particle.color,
  );
}
