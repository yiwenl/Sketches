struct SceneUniforms {
  viewProj: mat4x4<f32>,
  cameraRight: vec4<f32>,
  cameraUp: vec4<f32>,
}

struct Particle {
  posSize: vec4<f32>,
  velocity: vec4<f32>,
  color: vec4<f32>,
}

struct ShadowUniforms {
  lightViewProj: mat4x4<f32>,
  params: vec4<f32>, // x = strength, y = map size, z = bias
}

@group(0) @binding(0) var<uniform> scene: SceneUniforms;
@group(1) @binding(0) var<storage, read> particles: array<Particle>;
@group(2) @binding(0) var<uniform> shadow: ShadowUniforms;
@group(2) @binding(1) var shadowMap: texture_depth_2d;
@group(2) @binding(2) var shadowSampler: sampler_comparison;

struct VertexInput {
  @location(0) localPosition: vec3<f32>,
  @builtin(instance_index) instance: u32,
}

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec4<f32>,
  @location(1) local: vec2<f32>,
  @location(2) shadowCoord: vec4<f32>,
}

@vertex
fn vs_main(input: VertexInput) -> VertexOutput {
  let particle = particles[input.instance];
  let local = input.localPosition.xy;
  let worldPos =
    particle.posSize.xyz +
    scene.cameraRight.xyz * local.x * particle.posSize.w +
    scene.cameraUp.xyz * local.y * particle.posSize.w;

  var output: VertexOutput;
  let world = vec4<f32>(worldPos, 1.0);
  output.position = scene.viewProj * world;
  output.color = particle.color;
  output.local = local;
  output.shadowCoord = shadow.lightViewProj * world;
  return output;
}

@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4<f32> {
  let d = length(input.local * 2.0);
  if (d > 1.0) {
    discard;
  }

  let visibility = sampleShadowPcf3x3(
    shadowMap,
    shadowSampler,
    input.shadowCoord,
    shadow.params.y,
    shadow.params.z,
  );
  let shade = mix(1.0 - shadow.params.x, 1.0, visibility);
  let colorGrad = vec3(1.0, 0.98, 0.96);
  return vec4<f32>(input.color.rgb * shade * colorGrad, 1.0);
}
