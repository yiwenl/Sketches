struct ParamUniforms {
  deltaTime : f32,
  totalTime : f32,
  maxRadius : f32,
  noiseScale : f32,
  forceStrength : f32,
  speedScale : f32,
  maxSpeed : f32,
  _pad0 : f32,
};
@group(0) @binding(0) var<uniform> params : ParamUniforms;

#include "noise.wgsl"

struct Particle {
  position : vec3<f32>,
  speed : f32, 
  velocity : vec3<f32>,
  life : f32,
  color : vec3<f32>,
  size : f32,
  extra : vec3<f32>,
  lifeDecrease : f32,
  origin : vec3<f32>,
  currentSpeed : f32, 
};
@group(0) @binding(1) var<storage, read_write> particles : array<Particle>;

@group(0) @binding(2) var fluidTexture : texture_3d<f32>;
@group(0) @binding(3) var fluidSampler : sampler;
@group(0) @binding(4) var densityTexture : texture_3d<f32>;

// ... (Simplex Noise implementation remains the same) ...

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) GlobalInvocationID : vec3<u32>) {
  let index = GlobalInvocationID.x;
  if (index >= arrayLength(&particles)) {
    return;
  }

  var particle = particles[index];
  
  // Update Life
  particle.life -= particle.lifeDecrease * params.deltaTime;
  
  // Reset if dead
  if (particle.life <= 0.0) {
    particle.position = particle.origin;
    particle.velocity = vec3<f32>(0.0, 0.0, 0.0);
    particle.life = 1.0;
  }

  // 1. Calculate Acceleration via Curl Noise
  let noiseScale = params.noiseScale;
  let forceStrength = params.forceStrength; 
  
  // Animate noise field
  let timeOffset = params.totalTime * 2.0;
  
  var acceleration = vec3<f32>(0.0, 0.0, 0.0);

  // Fluid Force
  let fluidUV = (particle.position / params.maxRadius) * 0.5 + 0.5;
  let fluidVelocity = textureSampleLevel(fluidTexture, fluidSampler, fluidUV, 0.0).xyz;
  let fluidDensity = textureSampleLevel(densityTexture, fluidSampler, fluidUV, 0.0).x;

  let fluidInfluence = mix(1.0, 2.0, particle.extra.y) * 10.0;
  acceleration += fluidVelocity * fluidInfluence * (1.0 + fluidDensity * 20.0) * particle.speed;

  // 2. Boundary Force (Push back to center)
  let maxRadius = params.maxRadius; 
  var dist = length(particle.position);
  let pushStrength = 5.0;
  

  dist = max(dist, 0.01);
  let t = dist / maxRadius;
  let centerDir = -normalize(particle.position);
  let boundaryForce = centerDir * pow(t, 4.0) * pushStrength;
  acceleration += boundaryForce;


  // 2.5 add force pulling particles to center
  
  let d = length(particle.position);
  let pullStrength = 5.0 * smoothstep(maxRadius * 0.25, maxRadius, d);
  let pullForce = normalize(particle.position) * pullStrength;
   acceleration -= pullForce;  
  
  // 3. Update Velocity
  particle.velocity += acceleration * params.deltaTime;

  // 4. Apply Friction
  let friction = 0.97;
  particle.velocity = particle.velocity * friction;

  // 4.5 Speed Limit
  let speed = length(particle.velocity);
  if (speed > params.maxSpeed) {
    particle.velocity = (particle.velocity / speed) * params.maxSpeed;
  }

  // 5. Update Position
  let baseMovement = 50.0; 
  particle.position += particle.velocity * params.deltaTime * baseMovement * params.speedScale;
  
  // Hard limit
  if (length(particle.position) > maxRadius) {
     particle.position = normalize(particle.position) * maxRadius;
     particle.velocity *= -0.5;
  }
  
  // Write back current speed for color mapping
  particle.currentSpeed = speed;
  
  // Write back
  particles[index] = particle;
}

