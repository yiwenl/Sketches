struct Particle {
  posSize: vec4<f32>,
  velocity: vec4<f32>,
  color: vec4<f32>,
}

struct HistoryParams {
  writeSlot: u32,
  historyLength: u32,
  particleCount: u32,
  radiusScale: f32,
}

@group(0) @binding(0) var<uniform> params: HistoryParams;
@group(0) @binding(1) var<storage, read> particles: array<Particle>;
@group(0) @binding(2) var<storage, read_write> history: array<vec4<f32>>;

@compute @workgroup_size(256)
fn cs_main(@builtin(global_invocation_id) globalId: vec3<u32>) {
  let i = globalId.x;
  if (i >= params.particleCount) {
    return;
  }

  let slot = params.writeSlot % params.historyLength;
  history[slot * params.particleCount + i] = vec4<f32>(particles[i].posSize.xyz, 1.0);
}
