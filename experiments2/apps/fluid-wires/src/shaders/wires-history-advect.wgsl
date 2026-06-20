struct HistoryParams {
  writeSlot: u32,
  historyLength: u32,
  particleCount: u32,
  radiusScale: f32,
  dt: f32,
  maxRadius: f32,
  historyFluidStrength: f32,
  densityForceScale: f32,
}

@group(0) @binding(0) var<uniform> params: HistoryParams;
@group(0) @binding(1) var<storage, read_write> history: array<vec4<f32>>;
@group(0) @binding(2) var velocityTex: texture_3d<f32>;
@group(0) @binding(3) var densityTex: texture_3d<f32>;

fn textureCoordFromWorld(pos: vec3<f32>) -> vec3<i32> {
  let dims = textureDimensions(velocityTex);
  let uvw = clamp(pos / (params.maxRadius * 2.0) + vec3<f32>(0.5), vec3<f32>(0.0), vec3<f32>(0.999));
  let coord = vec3<i32>(uvw * vec3<f32>(dims));
  return clamp(coord, vec3<i32>(0), vec3<i32>(dims) - vec3<i32>(1));
}

@compute @workgroup_size(256)
fn cs_main(@builtin(global_invocation_id) globalId: vec3<u32>) {
  let i = globalId.x;
  let totalCount = params.particleCount * params.historyLength;
  if (i >= totalCount) {
    return;
  }

  var pos = history[i].xyz;
  let coord = textureCoordFromWorld(pos);
  let fluidVelocity = textureLoad(velocityTex, coord, 0).xyz;
  let density = max(textureLoad(densityTex, coord, 0).x, 0.0);
  let densityInfluence = 0.25 + density * params.densityForceScale;
  pos += fluidVelocity * params.historyFluidStrength * densityInfluence * params.dt;

  let dist = length(pos);
  if (dist > params.maxRadius) {
    pos = normalize(pos) * params.maxRadius;
  }

  history[i] = vec4<f32>(pos, 1.0);
}
