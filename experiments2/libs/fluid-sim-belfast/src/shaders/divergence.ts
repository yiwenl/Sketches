import { COMMON_WGSL } from "./common";

export default /* wgsl */ `
struct PassParams {
  gridSize: f32,
  _pad0: f32,
  _pad1: f32,
  _pad2: f32,
}

@group(0) @binding(0) var<uniform> params: PassParams;
@group(0) @binding(1) var velocityIn: texture_3d<f32>;
@group(0) @binding(2) var divergenceOut: texture_storage_3d<rgba32float, write>;

${COMMON_WGSL}

@compute @workgroup_size(4, 4, 4)
fn cs_main(@builtin(global_invocation_id) globalId: vec3<u32>) {
  let gridSize = u32(params.gridSize);
  if (globalId.x >= gridSize || globalId.y >= gridSize || globalId.z >= gridSize) {
    return;
  }

  let uvw = (vec3<f32>(globalId) + 0.5) / params.gridSize;
  let texelSize = 1.0 / params.gridSize;

  let L = sampleVelocityMirrored(velocityIn, uvw - vec3(texelSize, 0.0, 0.0), params.gridSize).x;
  let R = sampleVelocityMirrored(velocityIn, uvw + vec3(texelSize, 0.0, 0.0), params.gridSize).x;
  let B = sampleVelocityMirrored(velocityIn, uvw - vec3(0.0, texelSize, 0.0), params.gridSize).y;
  let T = sampleVelocityMirrored(velocityIn, uvw + vec3(0.0, texelSize, 0.0), params.gridSize).y;
  let D = sampleVelocityMirrored(velocityIn, uvw - vec3(0.0, 0.0, texelSize), params.gridSize).z;
  let F = sampleVelocityMirrored(velocityIn, uvw + vec3(0.0, 0.0, texelSize), params.gridSize).z;

  let div = 0.5 * (R - L + T - B + F - D);
  textureStore(divergenceOut, globalId, vec4<f32>(div, 0.0, 0.0, 0.0));
}
`;
