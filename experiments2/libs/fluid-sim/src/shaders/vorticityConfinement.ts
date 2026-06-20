import { COMMON_WGSL } from "./common";

export default /* wgsl */ `
struct VorticityParams {
  gridSize: f32,
  dt: f32,
  curl: f32,
}

@group(0) @binding(0) var<uniform> params: VorticityParams;
@group(0) @binding(1) var velocityIn: texture_2d<f32>;
@group(0) @binding(2) var velocityOut: texture_storage_2d<rgba32float, write>;

${COMMON_WGSL}

fn computeCurl(tex: texture_2d<f32>, c: vec2<i32>, gs: f32) -> f32 {
  let vL = sampleVec2Offset(tex, c - vec2(1, 0), gs);
  let vR = sampleVec2Offset(tex, c + vec2(1, 0), gs);
  let vB = sampleVec2Offset(tex, c - vec2(0, 1), gs);
  let vT = sampleVec2Offset(tex, c + vec2(0, 1), gs);

  return 0.5 * ((vR.y - vL.y) - (vT.x - vB.x));
}

@compute @workgroup_size(4, 4, 1)
fn cs_main(@builtin(global_invocation_id) globalId: vec3<u32>) {
  let gridSize = u32(params.gridSize);
  if (globalId.x >= gridSize || globalId.y >= gridSize) {
    return;
  }

  let gs = params.gridSize;
  let c = vec2<i32>(globalId.xy);

  let cL = abs(computeCurl(velocityIn, c - vec2(1, 0), gs));
  let cR = abs(computeCurl(velocityIn, c + vec2(1, 0), gs));
  let cB = abs(computeCurl(velocityIn, c - vec2(0, 1), gs));
  let cT = abs(computeCurl(velocityIn, c + vec2(0, 1), gs));

  let eta = vec2<f32>(cR - cL, cT - cB);
  var force = vec2<f32>(0.0);

  if (length(eta) > 0.0) {
    let n = normalize(eta);
    let cCenter = computeCurl(velocityIn, c, gs);
    force = params.curl * cCenter * vec2<f32>(n.y, -n.x);
  }

  let vel = textureLoad(velocityIn, c, 0).xy;
  textureStore(velocityOut, c, vec4(vel + force * params.dt, 0.0, 0.0));
}
`;
