struct Uniforms {
  viewMatrix : mat4x4<f32>,
  projectionMatrix : mat4x4<f32>,
  shadowMatrix : mat4x4<f32>,
  lightPos : vec3<f32>,
  isShadowPass : f32,
  lightDir : vec3<f32>,
  shadowScaleBoost : f32,
  innerAngle : f32,
  outerAngle : f32,
  particleScale : f32,
  maxSpeed : f32,
  maxRadius : f32,
}
@group(0) @binding(0) var<uniform> uniforms : Uniforms;
@group(0) @binding(1) var shadowMap: texture_depth_2d;
@group(0) @binding(2) var shadowSampler: sampler_comparison;
@group(0) @binding(3) var colorMap1: texture_2d<f32>;
@group(0) @binding(4) var colorSampler: sampler;
@group(0) @binding(5) var colorMap2: texture_2d<f32>;
@group(0) @binding(6) var glowTexture: texture_3d<f32>;
@group(0) @binding(7) var lightSampler: sampler;

struct VertexOutput {
  @builtin(position) Position : vec4<f32>,
  @location(0) Color : vec3<f32>,
  @location(1) UV : vec2<f32>,
  @location(2) ShadowPos : vec3<f32>,
  @location(3) WorldPos : vec3<f32>,
  @location(4) Extra : vec2<f32>,
  @location(5) Speed : f32,
};

@vertex
fn vs_main(
  @location(0) quadPos : vec2<f32>,        // Vertex attribute: -0.5 to 0.5
  @location(1) position : vec3<f32>,       // Instance attribute
  @location(2) velocity : vec3<f32>,       // Instance attribute
  @location(3) color : vec3<f32>,          // Instance attribute
  @location(4) size : f32,                 // Instance attribute
  @location(5) extra : vec3<f32>,          // Instance attribute
  @location(6) speed : f32                 // Instance attribute
) -> VertexOutput {
  var output : VertexOutput;
  
  // Billboarding in View Space
  let viewPosition = uniforms.viewMatrix * vec4<f32>(position, 1.0);
  
  var finalSize = size * uniforms.particleScale;

  let speedScale = mix(0.5, 1.5, saturate(speed / uniforms.maxSpeed));
  finalSize *= speedScale;

  if (uniforms.isShadowPass > 0.5) {
    finalSize *= uniforms.shadowScaleBoost;
  }
  
  let offset = vec4<f32>(quadPos.x * finalSize, quadPos.y * finalSize, 0.0, 0.0);
  let finalViewPosition = viewPosition + offset;

  output.Position = uniforms.projectionMatrix * finalViewPosition;
  output.Color = color;
  output.UV = quadPos + 0.5;
  output.WorldPos = position;
  output.Extra = extra.zy;
  output.Speed = speed;

  // Shadow Coord calculation
  let shadowPos4 = uniforms.shadowMatrix * vec4<f32>(position, 1.0); 
  output.ShadowPos = shadowPos4.xyz / shadowPos4.w;

  return output;
}

@fragment
fn fs_main(
  @location(0) Color : vec3<f32>,
  @location(1) UV : vec2<f32>,
  @location(2) ShadowPos : vec3<f32>,
  @location(3) WorldPos : vec3<f32>,
  @location(4) Extra : vec2<f32>,
  @location(5) Speed: f32
) -> @location(0) vec4<f32> {
  // Round particles
  let dist = length(UV - vec2(0.5));
  if (dist > 0.5) {
    discard;
  }

  // Shadow Calculation (PCF)
  var shadow = 0.0;
  let size = vec2<f32>(textureDimensions(shadowMap));
  let texelSize = 2.0 / size;
  
  for (var x = -1; x <= 1; x++) {
    for (var y = -1; y <= 1; y++) {
      let pcfDepth = textureSampleCompare(
        shadowMap, 
        shadowSampler, 
        ShadowPos.xy + vec2<f32>(f32(x), f32(y)) * texelSize, 
        ShadowPos.z - 0.001 // Bias
      );
      shadow += pcfDepth;
    }
  }
  shadow /= 9.0;

  // Light Falloff
  let L = normalize(WorldPos - uniforms.lightPos);
  let lightDist = length(uniforms.lightPos - WorldPos);
  
  // Distance Falloff (inverse square)
  var atten = 1.0 / (1.0 + 0.01 * lightDist * lightDist);
  atten = smoothstep(0.05, 0.1, atten);

  // Spot light angle
  let theta = dot(L, normalize(uniforms.lightDir));
  let epsilon = uniforms.innerAngle - uniforms.outerAngle;
  let spotIntensity = clamp((theta - uniforms.outerAngle) / epsilon, 0.0, 1.0);

  // Apply lighting
  let ambient = 0.15;
  let diffuseFactor = shadow * atten * spotIntensity;
  let diffuse = 0.85 * diffuseFactor;
  
  let _speed = Speed - (Extra.x+0.25) * 0.5;
  let colorThreshold = 0.45;
  let speedFactor = smoothstep(
    uniforms.maxSpeed * colorThreshold, 
    uniforms.maxSpeed * (1-colorThreshold), 
    _speed);

  let highlightThreshold = mix(0.9, 1.0, fract(Extra.y + Extra.x));
  let highlight = smoothstep(uniforms.maxSpeed * highlightThreshold, uniforms.maxSpeed, Speed);

  let texColor1 = textureSample(colorMap1, colorSampler, Extra).rgb;
  var texColor2 = textureSample(colorMap2, colorSampler, Extra).rgb;
  texColor2 = pow(texColor2 + 0.1, vec3<f32>(1.5)) * mix(1.0, 1.5, highlight);
  var texColor = mix(texColor1, texColor2, speedFactor);

  // Volumetric Glow Sampling
  // The grid is mapped to maxRadius
  let glowCoord = (WorldPos / uniforms.maxRadius) * 0.5 + 0.5; 
  let glowValue = textureSample(glowTexture, lightSampler, glowCoord).r;
  
  // Brightness boost
  texColor += texColor * glowValue * 5.0;

  // Increase contrast
  let contrast = 1.5;
  texColor = (texColor - 0.4) * contrast + 0.5;

  // Saturation boost
  let luma = dot(texColor, vec3<f32>(0.299, 0.587, 0.114));
  let saturation = 1.15;
  texColor = mix(vec3<f32>(luma), texColor, saturation);

  let finalColor = texColor * (ambient + diffuse);

  return vec4<f32>(finalColor, 1.0);
}

@fragment
fn fs_shadow(@location(1) UV : vec2<f32>) {
  let dist = length(UV - vec2(0.5));
  if (dist > 0.5) {
    discard;
  }
}
