struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) uv: vec2<f32>,
}

@vertex
fn vs_main(@builtin(vertex_index) VertexIndex: u32) -> VertexOutput {
  var pos = array<vec2<f32>, 3>(
    vec2<f32>(-1.0, -1.0),
    vec2<f32>( 3.0, -1.0),
    vec2<f32>(-1.0,  3.0)
  );
  var output: VertexOutput;
  output.position = vec4<f32>(pos[VertexIndex], 0.0, 1.0);
  output.uv = pos[VertexIndex] * 0.5 + 0.5;
  output.uv.y = 1.0 - output.uv.y;
  return output;
}

struct Uniforms {
  aspect: f32,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4<f32> {
  // Center roughly matches the light position
  let center = vec2<f32>(0.8, 0.2);
  var uv = input.uv;
  uv.x *= uniforms.aspect;
  var c = center;
  c.x *= uniforms.aspect;
  
  let d = distance(uv, c);
  // Match the CSS radial gradient falloff roughly: 80% means at 0.8 distance it's #080808
  // The max distance from (0.8, 0.2) to (0.0, 1.0) is about 1.13
  // 80% of max distance is around 0.9.
  let t = clamp(d / 0.9, 0.0, 1.0);
  
  let color1 = vec3<f32>(0.1647, 0.1647, 0.1647); // #2a2a2a
  let color2 = vec3<f32>(0.0313, 0.0313, 0.0313); // #080808
  let color = mix(color1, color2, t);
  
  return vec4<f32>(color, 1.0);
}
