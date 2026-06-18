export default /* wgsl */ `
struct SliceUniforms {
  viewProj: mat4x4<f32>,
  texSize: f32,
  volumeExtent: f32,
  showVelocity: f32,
  showDensity: f32,
  densityGain: f32,
  velocityThreshold: f32,
}

@group(0) @binding(0) var<uniform> scene: SliceUniforms;
@group(0) @binding(1) var velocityTex: texture_3d<f32>;
@group(0) @binding(2) var densityTex: texture_3d<f32>;

struct VertexInput {
  @location(0) position: vec3<f32>,
  @location(1) uv: vec2<f32>,
}

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) uv: vec2<f32>,
}

@vertex
fn vs_main(input: VertexInput) -> VertexOutput {
  var output: VertexOutput;
  output.position = scene.viewProj * vec4<f32>(input.position, 1.0);
  output.uv = input.uv;
  return output;
}

fn velocity_color(vel: vec3<f32>) -> vec3<f32> {
  let speed = length(vel);
  let dir = select(vec3<f32>(0.0, 1.0, 0.0), normalize(vel), speed > 0.0001);
  return vec3<f32>(
    max(dir.x, 0.0) * 0.85 + abs(dir.z) * 0.15,
    max(dir.y, 0.0),
    max(-dir.x, 0.0) * 0.85 + abs(dir.z) * 0.15
  );
}

@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4<f32> {
  let n = i32(scene.texSize);
  let maxCoord = vec2<i32>(n - 1);
  let xy = clamp(vec2<i32>(input.uv * scene.texSize), vec2<i32>(0), maxCoord);
  let coord = vec3<i32>(xy, n / 2);

  let vel = textureLoad(velocityTex, coord, 0).xyz;
  let density = max(textureLoad(densityTex, coord, 0).x, 0.0);
  let speed = length(vel);

  let densitySignal = max(density * scene.densityGain, 0.0);
  let densityAlpha = clamp(densitySignal * 2.5, 0.0, 1.0) * scene.showDensity;
  let velocityAlpha = smoothstep(
    scene.velocityThreshold,
    scene.velocityThreshold * 3.0,
    speed
  ) * scene.showVelocity * 0.5;
  let densityColor = mix(
    vec3<f32>(0.16, 0.02, 0.0),
    vec3<f32>(1.0, 0.5, 0.05),
    clamp(densitySignal, 0.0, 1.0)
  ) * densityAlpha;
  let velColor = velocity_color(vel) * velocityAlpha * (1.0 - densityAlpha);

  let color = densityColor + velColor;
  let grid = max(
    step(fract(input.uv.x * 16.0), 0.018),
    step(fract(input.uv.y * 16.0), 0.018)
  );
  let gridColor = vec3<f32>(0.04, 0.08, 0.12) * grid * 0.35;
  let alpha = max(max(densityAlpha, velocityAlpha), grid * 0.08);

  return vec4<f32>(color + gridColor, alpha);
}
`;
