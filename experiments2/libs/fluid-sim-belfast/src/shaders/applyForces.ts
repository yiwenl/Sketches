import { CURL_NOISE_WGSL } from "./splat";

export default /* wgsl */ `
struct ForceParams {
  grid: vec4<f32>,
  center: vec4<f32>,
  dir: vec4<f32>,
  force: vec4<f32>,
}

@group(0) @binding(0) var<uniform> params: ForceParams;
@group(0) @binding(1) var velocityIn: texture_3d<f32>;
@group(0) @binding(2) var densityIn: texture_3d<f32>;
@group(0) @binding(3) var velocityOut: texture_storage_3d<rgba32float, write>;
@group(0) @binding(4) var densityOut: texture_storage_3d<rgba32float, write>;

${CURL_NOISE_WGSL}

@compute @workgroup_size(4, 4, 4)
fn cs_main(@builtin(global_invocation_id) globalId: vec3<u32>) {
  let gridSize = u32(params.grid.x);
  if (globalId.x >= gridSize || globalId.y >= gridSize || globalId.z >= gridSize) {
    return;
  }

  var velocity = textureLoad(velocityIn, globalId, 0).xyz;
  var density = textureLoad(densityIn, globalId, 0).x;
  let dt = params.force.x;
  let strength = params.force.y;
  let radius = params.force.z;
  let densityScale = params.force.w;
  let noiseStrength = params.dir.w;
  let time = params.grid.y;

  // Sim-space cell centre in [-0.5, 0.5] — matches webgpu_particles applyForces.
  let p = (vec3<f32>(globalId) + 0.5) / params.grid.x - 0.5;
  let delta = p - params.center.xyz;
  let dist = length(delta);

  if (dist < radius) {
    let t = 1.0 - dist / radius;
    let influence = pow(t, 3.0) * strength;
    var finalDir = params.dir.xyz;
    if (noiseStrength > 0.0) {
      let noise = curlNoise(p * 5.0 + vec3(0.0, time * 0.3, 0.0));
      finalDir += noise * noiseStrength;
    }
    velocity += finalDir * influence * dt;
    density += influence * densityScale * 0.001;
  }

  textureStore(velocityOut, globalId, vec4(velocity, 0.0));
  textureStore(densityOut, globalId, vec4(density, 0.0, 0.0, 0.0));
}
`;
