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
@group(1) @binding(0) var<storage, read> cubes: array<Particle>;

struct VertexInput {
  @location(0) localPosition: vec3<f32>,
  @location(1) localNormal: vec3<f32>,
  @builtin(instance_index) instance: u32,
}

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
}

fn buildBasis(forwardInput: vec3<f32>) -> mat3x3<f32> {
  let speedSq = dot(forwardInput, forwardInput);
  let forward = select(
    vec3<f32>(0.0, 1.0, 0.0),
    forwardInput * inverseSqrt(max(speedSq, 0.000001)),
    speedSq > 0.000001
  );
  let helper = select(
    vec3<f32>(0.0, 1.0, 0.0),
    vec3<f32>(1.0, 0.0, 0.0),
    abs(forward.y) > 0.92
  );
  let right = normalize(cross(helper, forward));
  let up = cross(forward, right);
  return mat3x3<f32>(right, forward, up);
}

@vertex
fn vs_main(input: VertexInput) -> VertexOutput {
  let cube = cubes[input.instance];
  let basis = buildBasis(cube.velocity.xyz);
  let scale = vec3<f32>(cube.posSize.w * 0.35, cube.posSize.w * 3.2, cube.posSize.w * 0.35);
  let worldPos = cube.posSize.xyz + basis * (input.localPosition * scale);

  var output: VertexOutput;
  output.position = scene.viewProj * vec4<f32>(worldPos, 1.0);
  return output;
}

@fragment
fn fs_main() {}
