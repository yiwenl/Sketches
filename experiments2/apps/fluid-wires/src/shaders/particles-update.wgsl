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
  fluidForceScale: f32,
  densityForceScale: f32,
  damping: f32,
  centerForce: f32,
}

@group(0) @binding(0) var<uniform> params: SimParams;
@group(0) @binding(1) var<storage, read> particlesIn: array<Particle>;
@group(0) @binding(2) var<storage, read_write> particlesOut: array<Particle>;
@group(0) @binding(3) var velocityTex: texture_3d<f32>;
@group(0) @binding(4) var densityTex: texture_3d<f32>;

fn textureCoordFromWorld(pos: vec3<f32>) -> vec3<i32> {
  let dims = textureDimensions(velocityTex);
  let uvw = clamp(pos / (params.maxRadius * 2.0) + vec3<f32>(0.5), vec3<f32>(0.0), vec3<f32>(0.999));
  let coord = vec3<i32>(uvw * vec3<f32>(dims));
  return clamp(coord, vec3<i32>(0), vec3<i32>(dims) - vec3<i32>(1));
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

  let coord = textureCoordFromWorld(pos);
  let fluidVelocity = textureLoad(velocityTex, coord, 0).xyz;
  let density = max(textureLoad(densityTex, coord, 0).x, 0.0);
  let densityInfluence = 0.2 + density * params.densityForceScale;
  var force = fluidVelocity * params.fluidForceScale * densityInfluence;

  let dist = length(pos);
  let maxRadius = params.maxRadius;
  // let f = smoothstep(maxRadius * 0.5, maxRadius, dist);
  // force -= normalize(pos) * f * params.centerForce;
  let threshold = 0.6;
  if (dist > maxRadius * threshold) {
    var t = smoothstep(maxRadius, maxRadius * threshold, dist);
    t = 1.0 / max(t, 0.001);
    force -= normalize(pos) * t * params.centerForce;
  }
  

  let velDecay = 1.0 - smoothstep(maxRadius * 0.9, maxRadius, dist) * 0.03;
  vel *= velDecay;


  vel = (vel + force * params.dt * 0.25) * params.damping;

  let maxSpeed = particle.velocity.w;
  if(length(vel) > maxSpeed) {
    vel = normalize(vel) * maxSpeed;
  }
  pos = pos + vel * params.dt;


  particlesOut[i] = Particle(
    vec4<f32>(pos, particle.posSize.w),
    vec4<f32>(vel, particle.velocity.w),
    particle.color,
  );
}
