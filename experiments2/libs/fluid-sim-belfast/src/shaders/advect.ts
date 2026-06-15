import { COMMON_WGSL } from "./common";

export default /* wgsl */ `
struct PassParams {
  gridSize: f32,
  dissipation: f32,
  timestep: f32,
  _pad: f32,
}

@group(0) @binding(0) var<uniform> params: PassParams;
@group(0) @binding(1) var velocityIn: texture_3d<f32>;
@group(0) @binding(2) var mapIn: texture_3d<f32>;
@group(0) @binding(3) var mapOut: texture_storage_3d<rgba32float, write>;

${COMMON_WGSL}

@compute @workgroup_size(4, 4, 4)
fn cs_main(@builtin(global_invocation_id) globalId: vec3<u32>) {
  let gridSize = u32(params.gridSize);
  if (globalId.x >= gridSize || globalId.y >= gridSize || globalId.z >= gridSize) {
    return;
  }

  let pos = (vec3<f32>(globalId) + 0.5) / params.gridSize;
  let vel = textureLoad(velocityIn, globalId, 0).xyz;

  // Scale velocity from grid-space to normalized [0,1] UVW space
  let backPos = pos - vel * params.timestep / params.gridSize;

  // Use trilinear interpolation for smooth transport
  let sampled = sampleTrilinear(mapIn, backPos, params.gridSize);

  textureStore(mapOut, globalId, sampled * params.dissipation);
}
`;

