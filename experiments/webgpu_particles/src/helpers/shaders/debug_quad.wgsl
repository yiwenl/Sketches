struct VertexOutput {
  @builtin(position) position : vec4<f32>,
  @location(0) uv : vec2<f32>,
};

@vertex
fn vs_main(@builtin(vertex_index) vertexIndex : u32) -> VertexOutput {
  var pos = array<vec2<f32>, 6>(
    vec2<f32>(-1.0, -1.0), vec2<f32>( 1.0, -1.0), vec2<f32>(-1.0,  1.0),
    vec2<f32>(-1.0,  1.0), vec2<f32>( 1.0, -1.0), vec2<f32>( 1.0,  1.0)
  );

  var output : VertexOutput;
  output.position = vec4<f32>(pos[vertexIndex], 0.0, 1.0);
  output.uv = (pos[vertexIndex] + vec2<f32>(1.0)) * 0.5;
  output.uv.y = 1.0 - output.uv.y; // Flip Y
  return output;
}

@group(0) @binding(0) var depthTexture: texture_depth_2d;
@group(0) @binding(1) var mySampler: sampler;

@fragment
fn fs_main(@location(0) uv : vec2<f32>) -> @location(0) vec4<f32> {
  let d = textureSample(depthTexture, mySampler, uv);
  // Linearize or remap for visibility. 
  // Standard depth is very non-linear, so most objects are > 0.9.
  let v = clamp((d - 0.9) * 10.0, 0.0, 1.0);
  return vec4<f32>(v, v, v, 1.0);
}
