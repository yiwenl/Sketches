struct SceneUniforms {
  viewProj: mat4x4<f32>,
  lengthScale: f32,
  visGrid: f32,
  texSize: f32,
  volumeExtent: f32,
}

@group(0) @binding(0) var<uniform> scene: SceneUniforms;
@group(0) @binding(1) var velocityTex: texture_3d<f32>;
@group(0) @binding(2) var densityTex: texture_3d<f32>;

struct VertexInput {
  @location(0) localPos: vec3<f32>,
}

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec3<f32>,
}

@vertex
fn vs_main(input: VertexInput, @builtin(instance_index) instanceIndex: u32) -> VertexOutput {
  let visGrid = u32(scene.visGrid);
  let cellCount = visGrid * visGrid * visGrid;

  var output: VertexOutput;
  if (instanceIndex >= cellCount) {
    output.position = vec4<f32>(0.0, 0.0, -2.0, 1.0);
    output.color = vec3<f32>(0.0);
    return output;
  }

  let iz = instanceIndex / (visGrid * visGrid);
  let rem = instanceIndex % (visGrid * visGrid);
  let iy = rem / visGrid;
  let ix = rem % visGrid;

  let cell = vec3<f32>(f32(ix), f32(iy), f32(iz));
  let uvw = (cell + 0.5) / scene.visGrid;
  let center = (uvw - 0.5) * scene.volumeExtent;

  let coord = vec3<i32>((uvw - 0.5) * scene.texSize + scene.texSize * 0.5);
  let vel = textureLoad(velocityTex, coord, 0).xyz;
  let dens = textureLoad(densityTex, coord, 0).x;

  var direction = vel;
  let speed = length(direction);
  if (speed > 0.0001) {
    direction = direction / speed;
  } else {
    direction = vec3<f32>(0.0, 1.0, 0.0);
  }

  // Scale arrow by velocity magnitude (primary) and density (dye visibility).
  var arrowLen = max(speed * scene.lengthScale, dens * scene.lengthScale * 0.25);
  arrowLen = max(arrowLen, 0.002);
  let worldPos = center + input.localPos.y * direction * arrowLen;
  output.position = scene.viewProj * vec4<f32>(worldPos, 1.0);
  // Green channel highlights upward (+Y) flow.
  output.color = abs(direction) * 0.7 + vec3<f32>(0.08);
  return output;
}

@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4<f32> {
  return vec4<f32>(input.color, 1.0);
}
