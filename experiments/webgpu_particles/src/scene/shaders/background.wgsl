struct Uniforms {
  aspect : f32,
  time : f32,
  _padding1 : f32,
  _padding2 : f32,
}
@group(0) @binding(0) var<uniform> uniforms : Uniforms;

struct VertexOutput {
  @builtin(position) Position : vec4<f32>,
  @location(0) uv : vec2<f32>,
};

@vertex
fn vs_main(@builtin(vertex_index) vertexIndex : u32) -> VertexOutput {
  var pos = array<vec2<f32>, 6>(
    vec2<f32>(-1.0, -1.0),
    vec2<f32>( 1.0, -1.0),
    vec2<f32>(-1.0,  1.0),
    vec2<f32>(-1.0,  1.0),
    vec2<f32>( 1.0, -1.0),
    vec2<f32>( 1.0,  1.0)
  );

  var output : VertexOutput;
  output.Position = vec4<f32>(pos[vertexIndex], 0.0, 1.0);
  output.uv = pos[vertexIndex] * 0.5 + 0.5;
  return output;
}

@fragment
fn fs_main(@location(0) uv : vec2<f32>) -> @location(0) vec4<f32> {
  let center = vec2<f32>(0.5, 0.5); 
  var diff = uv - center;
  
  // Respect aspect ratio
  diff.x *= uniforms.aspect;
  
  let dist = length(diff);
  
  // Background colors
  let colorCenter = vec3<f32>(0.15, 0.145, 0.142);
  let colorEdge = vec3<f32>(0.08, 0.078, 0.076);
  
  // Falloff (radial gradient)
  let t = smoothstep(0.0, 1.2, dist);
  let finalColor = mix(colorCenter, colorEdge, t);

  return vec4<f32>(finalColor, 1.0);
}
