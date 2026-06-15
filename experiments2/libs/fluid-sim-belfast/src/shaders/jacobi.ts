import { COMMON_WGSL } from "./common";

export default /* wgsl */ `
struct PassParams {
  gridSize: f32,
  _pad0: f32,
  _pad1: f32,
  _pad2: f32,
}

@group(0) @binding(0) var<uniform> params: PassParams;
@group(0) @binding(1) var pressureIn: texture_3d<f32>;
@group(0) @binding(2) var divergenceIn: texture_3d<f32>;
@group(0) @binding(3) var pressureOut: texture_storage_3d<rgba32float, write>;

${COMMON_WGSL}

@compute @workgroup_size(4, 4, 4)
fn cs_main(@builtin(global_invocation_id) globalId: vec3<u32>) {
  let gridSize = u32(params.gridSize);
  if (globalId.x >= gridSize || globalId.y >= gridSize || globalId.z >= gridSize) {
    return;
  }

  let c = vec3<i32>(globalId);
  let L = sampleScalarOffset(pressureIn, c - vec3(1, 0, 0), params.gridSize);
  let R = sampleScalarOffset(pressureIn, c + vec3(1, 0, 0), params.gridSize);
  let B = sampleScalarOffset(pressureIn, c - vec3(0, 1, 0), params.gridSize);
  let T = sampleScalarOffset(pressureIn, c + vec3(0, 1, 0), params.gridSize);
  let D = sampleScalarOffset(pressureIn, c - vec3(0, 0, 1), params.gridSize);
  let F = sampleScalarOffset(pressureIn, c + vec3(0, 0, 1), params.gridSize);
  let div = sampleScalarOffset(divergenceIn, c, params.gridSize);

  let p = (L + R + B + T + D + F - div) / 6.0;
  textureStore(pressureOut, globalId, vec4<f32>(p, 0.0, 0.0, 0.0));
}
`;
