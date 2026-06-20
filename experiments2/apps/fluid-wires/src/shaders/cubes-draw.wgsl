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
@group(1) @binding(0) var<storage, read> cubes: array<Particle>;
@group(2) @binding(0) var<uniform> shadow: ShadowUniforms;
@group(2) @binding(1) var shadowMap: texture_depth_2d;
@group(2) @binding(2) var shadowSampler: sampler_comparison;

struct VertexInput {
  @location(0) localPosition: vec3<f32>,
  @location(1) localNormal: vec3<f32>,
  @builtin(instance_index) instance: u32,
}

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec3<f32>,
  @location(1) normal: vec3<f32>,
  @location(2) shadowCoord: vec4<f32>,
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
  let local = input.localPosition * scale;
  let normal = normalize(basis * input.localNormal);
  let worldPos = cube.posSize.xyz + basis * local;
  let world = vec4<f32>(worldPos, 1.0);

  var output: VertexOutput;
  output.position = scene.viewProj * world;
  output.color = cube.color.rgb;
  output.normal = normal;
  output.shadowCoord = shadow.lightViewProj * world;
  return output;
}

@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4<f32> {
  let lightDir = normalize(vec3<f32>(1.0, 18.0, 8.0));
  var diffuse = max(dot(normalize(input.normal), lightDir), 0.0);
  diffuse = mix(0.7, 1.0, diffuse) + 0.1;
  let visibility = sampleShadowPcf3x3(
    shadowMap,
    shadowSampler,
    input.shadowCoord,
    shadow.params.y,
    shadow.params.z,
  );
  let shadowShade = mix(1.0 - shadow.params.x, 1.0, visibility);
  let lighting = diffuse * shadowShade;
  let colorGrad = vec3<f32>(1.0, 0.98, 0.96);
  return vec4<f32>(input.color * colorGrad * lighting, 1.0);
}
