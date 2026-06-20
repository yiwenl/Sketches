import { COMMON_WGSL } from "./common";

export default /* wgsl */ `
struct PassParams {
  gridSize: f32,
  dissipation: f32,
  timestep: f32,
  advectionScale: f32,
}

@group(0) @binding(0) var<uniform> params: PassParams;
@group(0) @binding(1) var velocityIn: texture_2d<f32>;
@group(0) @binding(2) var mapIn: texture_2d<f32>;
@group(0) @binding(3) var mapOut: texture_storage_2d<rgba32float, write>;

${COMMON_WGSL}

@compute @workgroup_size(4, 4, 1)
fn cs_main(@builtin(global_invocation_id) globalId: vec3<u32>) {
  let gridSize = u32(params.gridSize);
  if (globalId.x >= gridSize || globalId.y >= gridSize) {
    return;
  }

  let pos = (vec2<f32>(globalId.xy) + 0.5) / params.gridSize;
  let vel = textureLoad(velocityIn, globalId.xy, 0).xy;

  let backPos = pos - vel * params.timestep * params.advectionScale / params.gridSize;

  let sampled = sampleBilinear(mapIn, backPos, params.gridSize);

  textureStore(mapOut, globalId.xy, sampled * params.dissipation);
}
`;
