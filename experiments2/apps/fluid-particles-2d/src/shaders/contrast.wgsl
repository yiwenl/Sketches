@group(0) @binding(0) var passSampler: sampler;
@group(0) @binding(1) var inputTexture: texture_2d<f32>;

struct Uniforms {
  contrast: f32,
}
@group(0) @binding(2) var<uniform> uniforms: Uniforms;

@fragment
fn fs_main(@location(0) uv: vec2<f32>) -> @location(0) vec4<f32> {
  let color = textureSample(inputTexture, passSampler, uv);
  let contrasted = (color.rgb - 0.5) * uniforms.contrast + 0.5;
  return vec4<f32>(contrasted, color.a);
}
