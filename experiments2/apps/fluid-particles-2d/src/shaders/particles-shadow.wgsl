struct SceneUniforms {
  viewProj: mat4x4<f32>,
  cameraRight: vec4<f32>,
  cameraUp: vec4<f32>,
}

struct Particle {
  posSize: vec4<f32>,
  velocity: vec4<f32>,
  color: vec4<f32>,
  random: vec4<f32>,
}

@group(0) @binding(0) var<uniform> scene: SceneUniforms;
@group(1) @binding(0) var<storage, read> particles: array<Particle>;

struct VertexInput {
  @location(0) localPosition: vec3<f32>,
  @builtin(instance_index) instance: u32,
}

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) local: vec2<f32>,
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
  output.position = scene.viewProj * vec4<f32>(worldPos, 1.0);
  output.local = local;
  return output;
}

@fragment
fn fs_main(input: VertexOutput) {
  if (length(input.local * 2.0) > 1.0) {
    discard;
  }
}
