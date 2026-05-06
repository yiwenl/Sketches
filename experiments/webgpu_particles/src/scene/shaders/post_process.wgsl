struct Uniforms {
  time : f32,
  intensity : f32,
  vignetteIntensity : f32,
  aspect : f32,
}

@group(0) @binding(0) var<uniform> uniforms : Uniforms;
@group(0) @binding(1) var sceneTexture : texture_2d<f32>;
@group(0) @binding(2) var sceneSampler : sampler;

struct VertexOutput {
  @builtin(position) Position : vec4<f32>,
  @location(0) uv : vec2<f32>,
}

@vertex
fn vs_main(@builtin(vertex_index) VertexIndex : u32) -> VertexOutput {
  var pos = array<vec2<f32>, 3>(
    vec2<f32>(-1.0, -1.0),
    vec2<f32>(3.0, -1.0),
    vec2<f32>(-1.0, 3.0)
  );
  var output : VertexOutput;
  output.Position = vec4<f32>(pos[VertexIndex], 0.0, 1.0);
  output.uv = pos[VertexIndex] * 0.5 + 0.5;
  return output;
}

// Simple hash for pseudo-random grain
fn hash(p : vec2<f32>) -> f32 {
  var p3 = fract(vec3<f32>(p.xyx) * 0.13);
  p3 += dot(p3, p3.yzx + 3.333);
  return fract((p3.x + p3.y) * p3.z);
}

@fragment
fn fs_main(input : VertexOutput) -> @location(0) vec4<f32> {
  // Flip UV for sampling the scene texture (WebGPU texture coord vs NDC mismatch)
  let uv = vec2<f32>(input.uv.x, 1.0 - input.uv.y);
  let color = textureSample(sceneTexture, sceneSampler, uv).rgb;
  
  // Film Grain - use pixel coordinates for exactly 1-pixel sized noise
  let n = hash(input.Position.xy + uniforms.time);
  
  let grain = (n - 0.5) * uniforms.intensity;
  var finalColor = color + grain;
  
  // Vignette
  let uvCenter = input.uv - 0.5;
  // Respect aspect ratio for perfectly circular vignette
  let dist = length(vec2<f32>(uvCenter.x * uniforms.aspect, uvCenter.y));
  let vignette = smoothstep(0.7, 0.3, dist * uniforms.vignetteIntensity);
  finalColor *= vignette;
  
  return vec4<f32>(finalColor, 1.0);
}
