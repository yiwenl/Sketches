#include "noise.wgsl"

struct FluidParams {
  dt : f32,
  res : f32,
  velocityDecay : f32,
  forceStrength : f32,
  time : f32,
  pressureDecay : f32,
  densityDecay : f32,
  vorticity : f32,
}

@group(0) @binding(0) var<uniform> params : FluidParams;

// Velocity textures
@group(0) @binding(1) var velRead : texture_3d<f32>;
@group(0) @binding(2) var velWrite : texture_storage_3d<rgba16float, write>;
@group(0) @binding(3) var linSampler : sampler;

// Advection
@compute @workgroup_size(8, 8, 4)
fn advect(@builtin(global_invocation_id) id : vec3<u32>) {
  let res = params.res;
  if (f32(id.x) >= res || f32(id.y) >= res || f32(id.z) >= res) { return; }

  let pos = (vec3<f32>(id) + 0.5) / res;
  let velocity = textureLoad(velRead, id, 0).xyz;
  
  // Back-trace
  let backPos = pos - (velocity * params.dt);
  
  var newVel = textureSampleLevel(velRead, linSampler, backPos, 0.0).xyz;
  newVel *= params.velocityDecay;

  textureStore(velWrite, id, vec4<f32>(newVel, 0.0));
}

// Separate bindings for Density Advection to match the BindGroup in JS
@group(0) @binding(1) var advectVelRead : texture_3d<f32>;
@group(0) @binding(2) var denRead : texture_3d<f32>;
@group(0) @binding(3) var denWrite : texture_storage_3d<rgba16float, write>;
@group(0) @binding(4) var denSampler : sampler;

@compute @workgroup_size(8, 8, 4)
fn advectDensity(@builtin(global_invocation_id) id : vec3<u32>) {
  let res = params.res;
  if (f32(id.x) >= res || f32(id.y) >= res || f32(id.z) >= res) { return; }

  let pos = (vec3<f32>(id) + 0.5) / res;
  let velocity = textureLoad(advectVelRead, id, 0).xyz;
  
  let backPos = pos - (velocity * params.dt);
  
  var newDensity = textureSampleLevel(denRead, denSampler, backPos, 0.0).xyz;
  newDensity *= params.densityDecay;

  textureStore(denWrite, id, vec4<f32>(newDensity, 1.0));
}

struct Force {
  position_radius : vec4<f32>,
  direction_strength : vec4<f32>,
}
struct ForceList {
  count : u32,
  list : array<Force, 16>,
}

// Apply Forces
@group(1) @binding(0) var<uniform> dynamicForces : ForceList;
@group(1) @binding(1) var denReadInForces : texture_3d<f32>;
@group(1) @binding(2) var denWriteInForces : texture_storage_3d<rgba16float, write>;

@compute @workgroup_size(8, 8, 4)
fn applyForces(@builtin(global_invocation_id) id : vec3<u32>) {
  let res = params.res;
  if (f32(id.x) >= res || f32(id.y) >= res || f32(id.z) >= res) { return; }

  var velocity = textureLoad(velRead, id, 0).xyz;
  var density = textureLoad(denReadInForces, id, 0).x;
  let p = (vec3<f32>(id) + 0.5) / res - 0.5; // Grid position in -0.5 to 0.5 space

  for (var i = 0u; i < dynamicForces.count; i++) {
    let f = dynamicForces.list[i];
    let f_pos = f.position_radius.xyz;
    let f_radius = f.position_radius.w;
    let f_dir = f.direction_strength.xyz;
    let f_strength = f.direction_strength.w;

    let delta = p - f_pos;
    let dist = length(delta);
    
    if (dist < f_radius) {
      // Sharper falloff for a more concentrated "core" force
      let t = 1.0 - (dist / f_radius);
      let influence = pow(t, 3.0) * f_strength;
      velocity += f_dir * influence * params.dt;
      
      // Also add density with the same falloff
      density += influence * 0.01; 
    }
  }

  textureStore(velWrite, id, vec4<f32>(velocity, 0.0));
  textureStore(denWriteInForces, id, vec4<f32>(density, 0.0, 0.0, 0.0));
}

@group(0) @binding(3) var noiseDenRead : texture_3d<f32>;
@group(0) @binding(4) var noiseDenWrite : texture_storage_3d<rgba16float, write>;

@compute @workgroup_size(8, 8, 4)
fn applyNoiseForce(@builtin(global_invocation_id) id : vec3<u32>) {
  let res = params.res;
  if (f32(id.x) >= res || f32(id.y) >= res || f32(id.z) >= res) { return; }

  var velocity = textureLoad(velRead, id, 0).xyz;
  var density = textureLoad(noiseDenRead, id, 0).x;
  let p = (vec3<f32>(id) + 0.5) / res;
  
  // Apply a low-frequency curl noise to the fluid
  var noisePos = p * 2.0; // Slightly lower frequency
  var noiseOffset = snoise(p + params.time * 0.05);
  noiseOffset = noiseOffset * 0.5 + 0.5;
  noiseOffset = mix(0.5, 2.0, noiseOffset);
  noisePos = p * noiseOffset;
  let force = curlNoise(noisePos * noiseOffset);
  
  // Add velocity
  velocity += force * params.forceStrength * 0.1;
  
  // Also add a tiny bit of density based on noise intensity to make it visible
  density += length(force) * 0.005;

  textureStore(velWrite, id, vec4<f32>(velocity, 0.0));
  textureStore(noiseDenWrite, id, vec4<f32>(density, 0.0, 0.0, 0.0));
}

// Divergence
@group(0) @binding(4) var divWrite : texture_storage_3d<rgba16float, write>;

@compute @workgroup_size(8, 8, 4)
fn computeDivergence(@builtin(global_invocation_id) id : vec3<u32>) {
  let res = params.res;
  let i = vec3<i32>(id);
  
  if (f32(id.x) >= res || f32(id.y) >= res || f32(id.z) >= res) { return; }

  let vL = textureLoad(velRead, clamp(i - vec3(1, 0, 0), vec3(0), vec3(i32(res)-1)), 0).x;
  let vR = textureLoad(velRead, clamp(i + vec3(1, 0, 0), vec3(0), vec3(i32(res)-1)), 0).x;
  let vB = textureLoad(velRead, clamp(i - vec3(0, 1, 0), vec3(0), vec3(i32(res)-1)), 0).y;
  let vT = textureLoad(velRead, clamp(i + vec3(0, 1, 0), vec3(0), vec3(i32(res)-1)), 0).y;
  let vD = textureLoad(velRead, clamp(i - vec3(0, 0, 1), vec3(0), vec3(i32(res)-1)), 0).z;
  let vU = textureLoad(velRead, clamp(i + vec3(0, 0, 1), vec3(0), vec3(i32(res)-1)), 0).z;

  let div = 0.5 * (vR - vL + vT - vB + vU - vD);
  textureStore(divWrite, id, vec4<f32>(div, 0.0, 0.0, 0.0));
}

// Jacobi Pressure
@group(0) @binding(5) var pressureRead : texture_3d<f32>;
@group(0) @binding(6) var pressureWrite : texture_storage_3d<r32float, write>;
@group(0) @binding(7) var divergenceRead : texture_3d<f32>;

@compute @workgroup_size(8, 8, 4)
fn jacobi(@builtin(global_invocation_id) id : vec3<u32>) {
  let res = params.res;
  let i = vec3<i32>(id);
  if (f32(id.x) >= res || f32(id.y) >= res || f32(id.z) >= res) { return; }

  let div = textureLoad(divergenceRead, i, 0).x;

  let pL = textureLoad(pressureRead, clamp(i - vec3(1, 0, 0), vec3(0), vec3(i32(res)-1)), 0).x;
  let pR = textureLoad(pressureRead, clamp(i + vec3(1, 0, 0), vec3(0), vec3(i32(res)-1)), 0).x;
  let pB = textureLoad(pressureRead, clamp(i - vec3(0, 1, 0), vec3(0), vec3(i32(res)-1)), 0).x;
  let pT = textureLoad(pressureRead, clamp(i + vec3(0, 1, 0), vec3(0), vec3(i32(res)-1)), 0).x;
  let pD = textureLoad(pressureRead, clamp(i - vec3(0, 0, 1), vec3(0), vec3(i32(res)-1)), 0).x;
  let pU = textureLoad(pressureRead, clamp(i + vec3(0, 0, 1), vec3(0), vec3(i32(res)-1)), 0).x;

  let newP = (pL + pR + pB + pT + pD + pU - div) / 6.0;
  textureStore(pressureWrite, id, vec4<f32>(newP * params.pressureDecay, 0.0, 0.0, 0.0));
}

// Project
@compute @workgroup_size(8, 8, 4)
fn project(@builtin(global_invocation_id) id : vec3<u32>) {
  let res = params.res;
  let i = vec3<i32>(id);
  if (f32(id.x) >= res || f32(id.y) >= res || f32(id.z) >= res) { return; }

  var velocity = textureLoad(velRead, i, 0).xyz;

  let pL = textureLoad(pressureRead, clamp(i - vec3(1, 0, 0), vec3(0), vec3(i32(res)-1)), 0).x;
  let pR = textureLoad(pressureRead, clamp(i + vec3(1, 0, 0), vec3(0), vec3(i32(res)-1)), 0).x;
  let pB = textureLoad(pressureRead, clamp(i - vec3(0, 1, 0), vec3(0), vec3(i32(res)-1)), 0).x;
  let pT = textureLoad(pressureRead, clamp(i + vec3(0, 1, 0), vec3(0), vec3(i32(res)-1)), 0).x;
  let pD = textureLoad(pressureRead, clamp(i - vec3(0, 0, 1), vec3(0), vec3(i32(res)-1)), 0).x;
  let pU = textureLoad(pressureRead, clamp(i + vec3(0, 0, 1), vec3(0), vec3(i32(res)-1)), 0).x;

  velocity -= 0.5 * vec3<f32>(pR - pL, pT - pB, pU - pD);
  textureStore(velWrite, id, vec4<f32>(velocity, 0.0));
}

// Vorticity Confinement (Swirl Reinforcement)
@group(0) @binding(4) var vorticityWrite : texture_storage_3d<rgba16float, write>; // Reuse divergence binding slot for magnitude
@group(0) @binding(7) var vorticityRead : texture_3d<f32>;

@compute @workgroup_size(8, 8, 4)
fn computeVorticity(@builtin(global_invocation_id) id : vec3<u32>) {
    let res = params.res;
    let i = vec3<i32>(id);
    if (f32(id.x) >= res || f32(id.y) >= res || f32(id.z) >= res) { return; }

    // Central difference for curl
    let vL = textureLoad(velRead, clamp(i - vec3(1, 0, 0), vec3(0), vec3(i32(res)-1)), 0).xyz;
    let vR = textureLoad(velRead, clamp(i + vec3(1, 0, 0), vec3(0), vec3(i32(res)-1)), 0).xyz;
    let vB = textureLoad(velRead, clamp(i - vec3(0, 1, 0), vec3(0), vec3(i32(res)-1)), 0).xyz;
    let vT = textureLoad(velRead, clamp(i + vec3(0, 1, 0), vec3(0), vec3(i32(res)-1)), 0).xyz;
    let vD = textureLoad(velRead, clamp(i - vec3(0, 0, 1), vec3(0), vec3(i32(res)-1)), 0).xyz;
    let vU = textureLoad(velRead, clamp(i + vec3(0, 0, 1), vec3(0), vec3(i32(res)-1)), 0).xyz;

    let curl = vec3<f32>(
        (vT.z - vB.z) - (vU.y - vD.y),
        (vU.x - vD.x) - (vR.z - vL.z),
        (vR.y - vL.y) - (vT.x - vB.x)
    ) * 0.5;

    textureStore(vorticityWrite, id, vec4<f32>(length(curl), curl.x, curl.y, curl.z)); 
}

@compute @workgroup_size(8, 8, 4)
fn applyVorticity(@builtin(global_invocation_id) id : vec3<u32>) {
    let res = params.res;
    let i = vec3<i32>(id);
    if (f32(id.x) >= res || f32(id.y) >= res || f32(id.z) >= res) { return; }

    var velocity = textureLoad(velRead, id, 0).xyz;
    let curlData = textureLoad(vorticityRead, i, 0);
    let curl = curlData.yzw;

    // Gradient of vorticity magnitude
    let vL = textureLoad(vorticityRead, clamp(i - vec3(1, 0, 0), vec3(0), vec3(i32(res)-1)), 0).x;
    let vR = textureLoad(vorticityRead, clamp(i + vec3(1, 0, 0), vec3(0), vec3(i32(res)-1)), 0).x;
    let vB = textureLoad(vorticityRead, clamp(i - vec3(0, 1, 0), vec3(0), vec3(i32(res)-1)), 0).x;
    let vT = textureLoad(vorticityRead, clamp(i + vec3(0, 1, 0), vec3(0), vec3(i32(res)-1)), 0).x;
    let vD = textureLoad(vorticityRead, clamp(i - vec3(0, 0, 1), vec3(0), vec3(i32(res)-1)), 0).x;
    let vU = textureLoad(vorticityRead, clamp(i + vec3(0, 0, 1), vec3(0), vec3(i32(res)-1)), 0).x;

    var force = vec3<f32>(vR - vL, vT - vB, vU - vD) * 0.5;
    let EPS = 1e-5;
    force = normalize(force + vec3(EPS));

    velocity += cross(force, curl) * params.vorticity * params.dt;

    textureStore(velWrite, id, vec4<f32>(velocity, 0.0));
}
