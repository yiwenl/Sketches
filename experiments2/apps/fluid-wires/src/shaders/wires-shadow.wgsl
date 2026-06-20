struct SceneUniforms {
  viewProj: mat4x4<f32>,
  cameraRight: vec4<f32>,
  cameraUp: vec4<f32>,
}

struct HistoryParams {
  writeSlot: u32,
  historyLength: u32,
  particleCount: u32,
  radiusScale: f32,
}

@group(0) @binding(0) var<uniform> scene: SceneUniforms;
@group(1) @binding(0) var<storage, read> history: array<vec4<f32>>;
@group(1) @binding(1) var<uniform> historyParams: HistoryParams;

struct VertexInput {
  @location(0) nodeSide: vec2<f32>,
  @builtin(instance_index) instance: u32,
}

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) skip: f32,
}

const PI: f32 = 3.1415926535897932384626433832795;
const WIRE_RADIUS: f32 = 0.025;
const WIRE_SIDES: f32 = 3.0;
const DISTANCE_SKIP: f32 = 0.4;

fn historyIndex(nodeIndex: u32, particleIndex: u32) -> u32 {
  let slot = (historyParams.writeSlot + historyParams.historyLength - (nodeIndex % historyParams.historyLength)) % historyParams.historyLength;
  return slot * historyParams.particleCount + particleIndex;
}

fn safeNormalize(v: vec3<f32>, fallback: vec3<f32>) -> vec3<f32> {
  let len = length(v);
  if (len > 0.00001) {
    return v / len;
  }
  return fallback;
}

fn frameNormal(tangent: vec3<f32>, angle: f32) -> vec3<f32> {
  let helper = select(vec3<f32>(0.0, 1.0, 0.0), vec3<f32>(1.0, 0.0, 0.0), abs(tangent.y) > 0.92);
  let normal = safeNormalize(cross(tangent, helper), vec3<f32>(0.0, 0.0, 1.0));
  let binormal = safeNormalize(cross(normal, tangent), vec3<f32>(0.0, 1.0, 0.0));
  return safeNormalize(normal * cos(angle) + binormal * sin(angle), normal);
}

@vertex
fn vs_main(input: VertexInput) -> VertexOutput {
  let nodeIndex = u32(input.nodeSide.x + 0.5);
  let sideIndex = input.nodeSide.y;
  let particleIndex = input.instance;
  let curr = history[historyIndex(nodeIndex, particleIndex)].xyz;
  let next = history[historyIndex(nodeIndex + 1u, particleIndex)].xyz;
  let dist = distance(curr, next);
  let tangent = safeNormalize(next - curr, vec3<f32>(1.0, 0.0, 0.0));
  let angle = (sideIndex / WIRE_SIDES) * PI * 2.0;
  let normal = frameNormal(tangent, angle);
  let radius = WIRE_RADIUS * historyParams.radiusScale * (1.0 - f32(nodeIndex) / f32(historyParams.historyLength) * 0.55);
  let worldPos = curr + normal * radius;

  var output: VertexOutput;
  output.position = scene.viewProj * vec4<f32>(worldPos, 1.0);
  output.skip = select(0.0, 1.0, dist > DISTANCE_SKIP);
  return output;
}

@fragment
fn fs_main(input: VertexOutput) {
  if (input.skip > 0.5) {
    discard;
  }
}
