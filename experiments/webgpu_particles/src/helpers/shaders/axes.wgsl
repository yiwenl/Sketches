struct Uniforms {
  viewProjectionMatrix : mat4x4<f32>,
}
@group(0) @binding(0) var<uniform> uniforms : Uniforms;

struct VertexOutput {
  @builtin(position) Position : vec4<f32>,
  @location(0) Color : vec3<f32>,
}

@vertex
fn vs_main(@location(0) position : vec3<f32>, @location(1) color : vec3<f32>) -> VertexOutput {
  var output : VertexOutput;
  output.Position = uniforms.viewProjectionMatrix * vec4<f32>(position, 1.0);
  output.Color = color;
  return output;
}

@fragment
fn fs_main(@location(0) Color : vec3<f32>) -> @location(0) vec4<f32> {
  return vec4<f32>(Color, 1.0);
}
