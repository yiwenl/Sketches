import { COMMON_WGSL } from "./common";

export default /* wgsl */ `
struct PassParams {
  gridSize: f32,
  dissipation: f32,
  _pad0: f32,
  _pad1: f32,
}

@group(0) @binding(0) var<uniform> params: PassParams;
@group(0) @binding(1) var pressureIn: texture_3d<f32>;
@group(0) @binding(2) var pressureOut: texture_storage_3d<rgba32float, write>;

${COMMON_WGSL}

@compute @workgroup_size(4, 4, 4)
fn cs_main(@builtin(global_invocation_id) globalId: vec3<u32>) {
  let gridSize = u32(params.gridSize);
  if (globalId.x >= gridSize || globalId.y >= gridSize || globalId.z >= gridSize) {
    return;
  }

  let c = vec3<i32>(globalId);
  let p = sampleScalarOffset(pressureIn, c, params.gridSize);
  textureStore(pressureOut, globalId, vec4<f32>(p * params.dissipation, 0.0, 0.0, 0.0));
}
`;
