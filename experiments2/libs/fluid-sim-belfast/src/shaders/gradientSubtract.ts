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
@group(0) @binding(2) var velocityIn: texture_3d<f32>;
@group(0) @binding(3) var velocityOut: texture_storage_3d<rgba32float, write>;

${COMMON_WGSL}

@compute @workgroup_size(4, 4, 4)
fn cs_main(@builtin(global_invocation_id) globalId: vec3<u32>) {
  let gridSize = u32(params.gridSize);
  if (globalId.x >= gridSize || globalId.y >= gridSize || globalId.z >= gridSize) {
    return;
  }

  let c = vec3<i32>(globalId);
  let pL = sampleScalarOffset(pressureIn, c - vec3(1, 0, 0), params.gridSize);
  let pR = sampleScalarOffset(pressureIn, c + vec3(1, 0, 0), params.gridSize);
  let pB = sampleScalarOffset(pressureIn, c - vec3(0, 1, 0), params.gridSize);
  let pT = sampleScalarOffset(pressureIn, c + vec3(0, 1, 0), params.gridSize);
  let pD = sampleScalarOffset(pressureIn, c - vec3(0, 0, 1), params.gridSize);
  let pF = sampleScalarOffset(pressureIn, c + vec3(0, 0, 1), params.gridSize);
  let v = sampleVec3Offset(velocityIn, c, params.gridSize);

  let grad = 0.5 * vec3(pR - pL, pT - pB, pF - pD);
  textureStore(velocityOut, globalId, vec4(v - grad, 0.0));
}
`;
