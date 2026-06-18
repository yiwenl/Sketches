import { COMMON_WGSL } from "./common";

export default /* wgsl */ `
struct VorticityParams {
  gridSize: f32,
  dt: f32,
  curl: f32,    // confinement strength (ε)
  _pad: f32,
}

@group(0) @binding(0) var<uniform> params: VorticityParams;
@group(0) @binding(1) var velocityIn: texture_3d<f32>;
@group(0) @binding(2) var velocityOut: texture_storage_3d<rgba32float, write>;

${COMMON_WGSL}

// Compute curl(v) = ∇ × v  via central differences
fn computeCurl(tex: texture_3d<f32>, c: vec3<i32>, gs: f32) -> vec3<f32> {
  let vL = sampleVec3Offset(tex, c - vec3(1, 0, 0), gs);
  let vR = sampleVec3Offset(tex, c + vec3(1, 0, 0), gs);
  let vB = sampleVec3Offset(tex, c - vec3(0, 1, 0), gs);
  let vT = sampleVec3Offset(tex, c + vec3(0, 1, 0), gs);
  let vD = sampleVec3Offset(tex, c - vec3(0, 0, 1), gs);
  let vF = sampleVec3Offset(tex, c + vec3(0, 0, 1), gs);
  let curlScale = 0.5 * gs;

  return curlScale * vec3<f32>(
    (vT.z - vB.z) - (vF.y - vD.y),
    (vF.x - vD.x) - (vR.z - vL.z),
    (vR.y - vL.y) - (vT.x - vB.x),
  );
}

@compute @workgroup_size(4, 4, 4)
fn cs_main(@builtin(global_invocation_id) globalId: vec3<u32>) {
  let gridSize = u32(params.gridSize);
  if (globalId.x >= gridSize || globalId.y >= gridSize || globalId.z >= gridSize) {
    return;
  }

  let c = vec3<i32>(globalId);
  let gs = params.gridSize;

  // Curl at this cell
  let omega = computeCurl(velocityIn, c, gs);

  // |curl| at neighbours for the gradient of |curl|
  let cL = length(computeCurl(velocityIn, c - vec3(1, 0, 0), gs));
  let cR = length(computeCurl(velocityIn, c + vec3(1, 0, 0), gs));
  let cB = length(computeCurl(velocityIn, c - vec3(0, 1, 0), gs));
  let cT = length(computeCurl(velocityIn, c + vec3(0, 1, 0), gs));
  let cD = length(computeCurl(velocityIn, c - vec3(0, 0, 1), gs));
  let cF = length(computeCurl(velocityIn, c + vec3(0, 0, 1), gs));

  // η = ∇|ω|  →  N = η / |η|
  let eta = vec3<f32>(cR - cL, cT - cB, cF - cD);
  let etaLen = length(eta);
  // Add a small epsilon to prevent amplifying microscopic grid noise into full-strength forces
  let N = eta / (etaLen + 1e-4);

  // Confinement force: f = epsilon * h * (N x omega).
  let texelSize = 1.0 / gs;
  let force = params.curl * cross(N, omega) * texelSize;

  let v = textureLoad(velocityIn, globalId, 0).xyz;
  textureStore(velocityOut, globalId, vec4(v + force * params.dt, 0.0));
}
`;
