
struct Particle {
  posSize: vec4<f32>,
  velocity: vec4<f32>,
  color: vec4<f32>,
  random: vec4<f32>,
}

struct SimParams {
  time: f32,
  dt: f32,
  maxRadius: f32,
  count: u32,
  fluidForceScale: f32,
  densityForceScale: f32,
  damping: f32,
  centerForce: f32,
  speedMultiplier: f32,
}

@group(0) @binding(0) var<uniform> params: SimParams;
@group(0) @binding(1) var<storage, read> particlesIn: array<Particle>;
@group(0) @binding(2) var<storage, read_write> particlesOut: array<Particle>;
@group(0) @binding(3) var velocityTex: texture_2d<f32>;
@group(0) @binding(4) var densityTex: texture_2d<f32>;

fn textureCoordFromWorld(pos: vec2<f32>) -> vec2<i32> {
  let dims = textureDimensions(velocityTex);
  let uv = clamp(pos / (params.maxRadius * 2.0) + vec2<f32>(0.5), vec2<f32>(0.0), vec2<f32>(0.999));
  let coord = vec2<i32>(uv * vec2<f32>(dims));
  return clamp(coord, vec2<i32>(0), vec2<i32>(dims) - vec2<i32>(1));
}

fn idleCurlNoise(pos: vec3<f32>, seed: vec4<f32>, time: f32) -> vec3<f32> {
  let phase = time * 0.8 + seed.w * 6.2831853;
  let p = pos * 0.32 + seed.xyz * 6.2831853;
  let curl = vec3<f32>(
    cos(p.y + phase) - sin(p.z - phase * 1.17),
    cos(p.z + phase * 1.31) - sin(p.x + phase),
    cos(p.x + phase * 0.83) - sin(p.y + phase * 1.11),
  );
  return normalize(curl + vec3<f32>(0.0001));
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

  let coord = textureCoordFromWorld(pos.xy);
  let fluidVelocity = textureLoad(velocityTex, coord, 0).xy;
  let density = max(textureLoad(densityTex, coord, 0).x, 0.0);
  let densityInfluence = 0.2 + density * params.densityForceScale;
  var force = vec3<f32>(fluidVelocity * params.fluidForceScale * densityInfluence, 0.0);
  
  // Z-axis curl noise and spring force
  let noiseZ = idleCurlNoise(pos * 5.0, particle.random * 0.1, params.time).z;
  force.z += noiseZ * 18.0;
  force.z -= pos.z * 4.0; // Spring force pulling back to Z=0

  let dist = length(pos);
  let maxRadius = params.maxRadius * 1.2;
  // let f = smoothstep(maxRadius * 0.5, maxRadius, dist);
  // force -= normalize(pos) * f * params.centerForce;
  let threshold = mix(0.2, 0.5, particle.random.y);
  if (dist > maxRadius * threshold) {
    var t = smoothstep(maxRadius, maxRadius * threshold, dist);
    t = 1.0 / max(t, 0.001);
    force -= normalize(pos) * t * params.centerForce;
  }
  

  let velDecay = 1.0 - smoothstep(maxRadius * 0.9, maxRadius, dist) * mix(0.01, 0.04, particle.random.x);
  vel *= pow(velDecay, params.dt * 60.0);

  let forceScale = mix(0.05, 0.02, particle.random.z) * 40.0;
  vel = (vel + force * params.dt * forceScale * params.speedMultiplier) * pow(params.damping, params.dt * 60.0);

  let maxSpeed = particle.velocity.w * 2.0;
  if(length(vel) > maxSpeed) {
    vel = normalize(vel) * maxSpeed;
  }
  pos = pos + vel * params.dt;


  particlesOut[i] = Particle(
    vec4<f32>(pos, particle.posSize.w),
    vec4<f32>(vel, particle.velocity.w),
    particle.color,
    particle.random,
  );
}
