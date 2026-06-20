export default /* wgsl */ `
struct ClearParams {
  gridSize: f32,
  dissipation: f32,
}

@group(0) @binding(0) var<uniform> params: ClearParams;
@group(0) @binding(1) var pressureIn: texture_2d<f32>;
@group(0) @binding(2) var pressureOut: texture_storage_2d<rgba32float, write>;

@compute @workgroup_size(4, 4, 1)
fn cs_main(@builtin(global_invocation_id) globalId: vec3<u32>) {
  let gridSize = u32(params.gridSize);
  if (globalId.x >= gridSize || globalId.y >= gridSize) {
    return;
  }

  let p = textureLoad(pressureIn, globalId.xy, 0).x;
  textureStore(pressureOut, globalId.xy, vec4(p * params.dissipation, 0.0, 0.0, 0.0));
}
`;
