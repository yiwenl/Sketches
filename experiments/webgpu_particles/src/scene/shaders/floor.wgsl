struct Uniforms {
  viewProj : mat4x4<f32>,
  shadowMatrix : mat4x4<f32>,
  lightPos : vec3<f32>,
  _pad0 : f32,
  lightDir : vec3<f32>,
  _pad1 : f32,
  spotParams : vec2<f32>,
  aspect : f32,
  lightIntensity : f32,
  resolution : vec2<f32>,
  maxRadius : f32,
}

@group(0) @binding(0) var<uniform> uniforms : Uniforms;
@group(0) @binding(1) var shadowMap : texture_depth_2d;
@group(0) @binding(2) var shadowSampler : sampler_comparison;
@group(0) @binding(3) var glowTexture : texture_3d<f32>;
@group(0) @binding(4) var glowSampler : sampler;

struct VertexOutput {
  @builtin(position) Position : vec4<f32>,
  @location(0) worldPos : vec3<f32>,
  @location(1) shadowPos : vec4<f32>,
}

@vertex
fn vs_main(@location(0) pos : vec3<f32>) -> VertexOutput {
  var output : VertexOutput;
  let worldPos = pos;
  output.worldPos = worldPos;
  output.Position = uniforms.viewProj * vec4<f32>(worldPos, 1.0);
  output.shadowPos = uniforms.shadowMatrix * vec4<f32>(worldPos, 1.0);
  return output;
}

@fragment
fn fs_main(input : VertexOutput) -> @location(0) vec4<f32> {
  // 1. Shadow Calculation
  let shadowCoords = input.shadowPos.xyz / input.shadowPos.w;
  
  var pcf : f32 = 0.0;
  let sizes = textureDimensions(shadowMap);
  let texelSize = 1.0 / vec2<f32>(sizes);
  
  for(var x = -1; x <= 1; x++) {
    for(var y = -1; y <= 1; y++) {
      let offset = vec2<f32>(f32(x), f32(y)) * texelSize;
      pcf += textureSampleCompare(shadowMap, shadowSampler, shadowCoords.xy + offset, shadowCoords.z - 0.002);
    }
  }
  let shadow = mix(1.0, pcf / 9.0, step(0.0, shadowCoords.x) * step(shadowCoords.x, 1.0) * step(0.0, shadowCoords.y) * step(shadowCoords.y, 1.0));

  // 2. Lighting
  let lightVec = uniforms.lightPos - input.worldPos;
  let lightDir = normalize(lightVec);
  let diff = max(dot(vec3<f32>(0.0, 1.0, 0.0), lightDir), 0.0);
  
  let spotDot = dot(lightDir, -normalize(uniforms.lightDir));
  let spotEffect = smoothstep(uniforms.spotParams.y, uniforms.spotParams.x, spotDot);
  
  // 3. Match Background
  let bgColor = vec3<f32>(0.08, 0.078, 0.076);

  // 4. Volumetric Glow
  let glowCoord = (input.worldPos / uniforms.maxRadius) * 0.5 + 0.5;
  let glowValue = textureSample(glowTexture, glowSampler, glowCoord).r;
  let floorGlow = glowValue * 2.0; // Use a fixed boost instead of tiny lightIntensity
  let glowColor = vec3<f32>(1.0, 0.5, 0.0) * floorGlow;

  // 5. Final Color
  // Add lighting and glow on top of background
  let lightContribution = diff * shadow * spotEffect * uniforms.lightIntensity;
  
  let centerDist = length(input.worldPos.xz);
  let floorAlpha = smoothstep(35.0, 15.0, centerDist);
  let finalColor = bgColor + lightContribution + glowColor;

  return vec4<f32>(finalColor, floorAlpha);
}
