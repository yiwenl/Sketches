// Camera-facing billboard planes, drawn back-to-front from the sorted keys,
// textured with a procedural ink-spray sprite atlas.
//
// Atlas UV is computed in the vertex shader; the fragment shader does a nearest
// texel fetch (textureLoad) for coverage (1 - r, black spray on white).

struct SceneUniforms {
  viewProj: mat4x4<f32>,
  cameraRight: vec4<f32>,
  cameraUp: vec4<f32>,
}

struct Plane {
  posSize: vec4<f32>, // xyz = world center, w = full size
  color: vec4<f32>,   // rgb + alpha
  params: vec4<f32>,  // x = sprite index
}

struct Key {
  dist: f32,
  index: u32,
}

struct AtlasInfo {
  grid: vec4<f32>, // x = cols, y = rows, z = planeScale
}

const ALPHA_CUTOFF: f32 = 0.02;

@group(0) @binding(0) var<uniform> scene: SceneUniforms;
@group(1) @binding(0) var<storage, read> planes: array<Plane>;
@group(1) @binding(1) var<storage, read> keys: array<Key>;
@group(2) @binding(0) var<uniform> atlas: AtlasInfo;
@group(2) @binding(1) var spriteTex: texture_2d<f32>;

struct VertexInput {
  @location(0) localPosition: vec3<f32>, // unit quad, xy in [-0.5, 0.5]
  @builtin(instance_index) instance: u32,
}

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec4<f32>,
  @location(1) atlasUv: vec2<f32>,
}

@vertex
fn vs_main(input: VertexInput) -> VertexOutput {
  let planeId = keys[input.instance].index;
  let plane = planes[planeId];
  let size = plane.posSize.w * atlas.grid.z;

  let worldPos =
    plane.posSize.xyz +
    scene.cameraRight.xyz * input.localPosition.x * size +
    scene.cameraUp.xyz * input.localPosition.y * size;

  let cols = atlas.grid.x;
  let rows = atlas.grid.y;
  let idx = u32(plane.params.x + 0.5);
  let col = f32(idx % u32(cols));
  let row = f32(idx / u32(cols));
  let local = input.localPosition.xy + vec2<f32>(0.5, 0.5);
  let atlasUv = (vec2<f32>(col, row) + local) / vec2<f32>(cols, rows);

  var output: VertexOutput;
  output.position = scene.viewProj * vec4<f32>(worldPos, 1.0);
  output.color = plane.color;
  output.atlasUv = atlasUv;
  return output;
}

@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4<f32> {
  let dims = textureDimensions(spriteTex);
  let maxCoord = vec2<i32>(dims) - vec2<i32>(1);
  let texel = clamp(
    vec2<i32>(input.atlasUv * vec2<f32>(dims)),
    vec2<i32>(0),
    maxCoord,
  );

  let coverage = 1.0 - textureLoad(spriteTex, texel, 0).r;
  if (coverage < ALPHA_CUTOFF) {
    discard;
  }

  return vec4<f32>(input.color.rgb, input.color.a * coverage);
}
