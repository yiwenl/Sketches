import { COMMON_WGSL } from "./common";

export default /* wgsl */ `
struct GridParams {
  gridSize: f32,
}

@group(0) @binding(0) var<uniform> params: GridParams;
@group(0) @binding(1) var pressureIn: texture_2d<f32>;
@group(0) @binding(2) var divergenceIn: texture_2d<f32>;
@group(0) @binding(3) var pressureOut: texture_storage_2d<rgba32float, write>;

${COMMON_WGSL}

@compute @workgroup_size(4, 4, 1)
fn cs_main(@builtin(global_invocation_id) globalId: vec3<u32>) {
  let gridSize = u32(params.gridSize);
  if (globalId.x >= gridSize || globalId.y >= gridSize) {
    return;
  }

  let c = vec2<i32>(globalId.xy);

  let pL = sampleScalarOffset(pressureIn, c - vec2(1, 0), params.gridSize);
  let pR = sampleScalarOffset(pressureIn, c + vec2(1, 0), params.gridSize);
  let pB = sampleScalarOffset(pressureIn, c - vec2(0, 1), params.gridSize);
  let pT = sampleScalarOffset(pressureIn, c + vec2(0, 1), params.gridSize);

  let div = textureLoad(divergenceIn, c, 0).x;

  let p = (pL + pR + pB + pT - div) / 4.0;

  textureStore(pressureOut, c, vec4(p, 0.0, 0.0, 0.0));
}
`;
