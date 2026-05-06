struct Uniforms {
  viewProjectionMatrix : mat4x4<f32>,
  maxRadius : f32,
  gridRes : f32,
  colorMode : f32, // 0: speed, 1: direction
  _padding1 : f32,
}

@group(0) @binding(0) var<uniform> uniforms : Uniforms;
@group(0) @binding(1) var velTexture : texture_3d<f32>;
@group(0) @binding(2) var denTexture : texture_3d<f32>;
@group(0) @binding(3) var linSampler : sampler;

struct VertexOutput {
  @builtin(position) Position : vec4<f32>,
  @location(0) Color : vec4<f32>,
}

@vertex
fn vs_main(
  @location(0) pos : vec3<f32>,
  @builtin(instance_index) instanceIdx : u32
) -> VertexOutput {
  let res = u32(uniforms.gridRes);
  let downsample = 3u; // Only show every 3rd cell
  let visualRes = res / downsample;

  // Calculate grid coordinates (i, j, k) based on downsampled grid
  let k = (instanceIdx / (visualRes * visualRes)) * downsample;
  let j = ((instanceIdx % (visualRes * visualRes)) / visualRes) * downsample;
  let i = (instanceIdx % visualRes) * downsample;
  
  if (k >= res || j >= res || i >= res) {
    var output : VertexOutput;
    output.Position = vec4<f32>(0.0, 0.0, 0.0, 0.0);
    return output;
  }
  
  let gridPos = vec3<u32>(i, j, k);
  let uv = (vec3<f32>(gridPos) + 0.5) / uniforms.gridRes;
  
  let velocity = textureSampleLevel(velTexture, linSampler, uv, 0.0).xyz;
  let density = textureSampleLevel(denTexture, linSampler, uv, 0.0).x;
  
  // World position of the grid cell center
  let worldCenter = (uv - 0.5) * 2.0 * uniforms.maxRadius;
  
  let speed = length(velocity);
  
  // Rotation and Scaling
  // We want to align the X-axis (unit needle) to the velocity direction
  var modelPos = pos;
  
  // Scale with density, but use a non-linear mapping to prevent extreme lengths
  // Maps 0 -> 0, and large values asymptotically to 1.0
  let d = density / (1.0 + density); 
  let scale = (0.1 + d * 0.9) * uniforms.maxRadius * 0.15;
  
  modelPos.x *= scale;
  modelPos.y *= 0.04; 
  modelPos.z *= 0.04;
  
  let forward = normalize(velocity + vec3<f32>(1e-6));
  if (speed > 0.0001) {
    var right = vec3<f32>(0.0, 1.0, 0.0);
    if (abs(dot(forward, right)) > 0.9) {
      right = vec3<f32>(0.0, 0.0, 1.0);
    }
    let up = normalize(cross(forward, right));
    let realRight = cross(up, forward);
    
    // Rotation matrix (columns are Basis vectors)
    let rot = mat3x3<f32>(forward, up, realRight);
    modelPos = rot * modelPos;
  }

  var output : VertexOutput;
  output.Position = uniforms.viewProjectionMatrix * vec4<f32>(modelPos + worldCenter, 1.0);
  
  // Color 
  var color = vec3<f32>(1.0);
  if (uniforms.colorMode < 0.5) {
      // Mode 0: Color by speed: Soft Teal (slow) -> Bright White (fast)
      color = mix(vec3<f32>(0.2, 0.5, 0.8), vec3<f32>(1.0, 1.0, 1.0), clamp(speed * 15.0, 0.0, 1.0));
  } else {
      // Mode 1: Color by direction
      color = abs(forward) * 0.8 + 0.2;
  }
  
  output.Color = vec4<f32>(color, 0.3);
  
  // Only show if there is ANY velocity
  if (speed < 0.0001) {
    output.Position = vec4<f32>(0.0);
  }

  return output;
}

@fragment
fn fs_main(@location(0) Color : vec4<f32>) -> @location(0) vec4<f32> {
  return Color;
}
