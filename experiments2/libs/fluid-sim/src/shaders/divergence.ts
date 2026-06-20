import { COMMON_WGSL } from "./common";

export default /* wgsl */ `
struct GridParams {
  gridSize: f32,
}

@group(0) @binding(0) var<uniform> params: GridParams;
@group(0) @binding(1) var velocityIn: texture_2d<f32>;
@group(0) @binding(2) var divergenceOut: texture_storage_2d<rgba32float, write>;

${COMMON_WGSL}

@compute @workgroup_size(4, 4, 1)
fn cs_main(@builtin(global_invocation_id) globalId: vec3<u32>) {
  let gridSize = u32(params.gridSize);
  if (globalId.x >= gridSize || globalId.y >= gridSize) {
    return;
  }

  let uv = (vec2<f32>(globalId.xy) + 0.5) / params.gridSize;
  let texelSize = 1.0 / params.gridSize;

  let L = sampleVelocityMirrored(velocityIn, uv - vec2(texelSize, 0.0), params.gridSize).x;
  let R = sampleVelocityMirrored(velocityIn, uv + vec2(texelSize, 0.0), params.gridSize).x;
  let B = sampleVelocityMirrored(velocityIn, uv - vec2(0.0, texelSize), params.gridSize).y;
  let T = sampleVelocityMirrored(velocityIn, uv + vec2(0.0, texelSize), params.gridSize).y;

  let div = 0.5 * ((R - L) + (T - B));

  textureStore(divergenceOut, globalId.xy, vec4(div, 0.0, 0.0, 0.0));
}
`;
