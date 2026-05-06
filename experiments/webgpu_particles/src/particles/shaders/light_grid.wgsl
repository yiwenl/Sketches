struct Uniforms {
  deltaTime : f32,
  maxRadius : f32,
  glowIntensity : f32,
  decay : f32,
}
@group(0) @binding(0) var<uniform> uniforms : Uniforms;

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
}
@group(0) @binding(1) var<storage, read> particles : array<Particle>;
@group(0) @binding(2) var<storage, read_write> gridBuffer : array<atomic<u32>>;
@group(0) @binding(3) var outTexture : texture_storage_3d<rgba16float, write>;

const GRID_SIZE = 64u;

@compute @workgroup_size(64)
fn splat(@builtin(global_invocation_id) GlobalInvocationID : vec3<u32>) {
  let index = GlobalInvocationID.x;
  if (index >= arrayLength(&particles)) { return; }

  let particle = particles[index];
  if (particle.life <= 0.0) { return; }

  // Map world position to grid coords [0, GRID_SIZE-1]
  let pos = (particle.position / uniforms.maxRadius) * 0.5 + 0.5;
  
  // Boundary Falloff: fade out near edges [0.0, 1.0]
  let edgeDist = min(pos, 1.0 - pos);
  let falloff = smoothstep(0.0, 0.1, min(edgeDist.x, min(edgeDist.y, edgeDist.z)));
  if (falloff <= 0.0) { return; }

  let fgridPos = pos * f32(GRID_SIZE - 1u);
  let i0 = vec3<u32>(fgridPos);
  let i1 = min(i0 + 1u, vec3<u32>(GRID_SIZE - 1u));
  let weight = fgridPos - vec3<f32>(i0);

  let intensityBase = particle.currentSpeed * uniforms.glowIntensity * falloff * 10000.0;

  // Trilinear Splatting (8 neighbors)
  let w = array<f32, 2>(1.0 - weight.x, weight.x);
  let h = array<f32, 2>(1.0 - weight.y, weight.y);
  let d = array<f32, 2>(1.0 - weight.z, weight.z);

  for (var k = 0u; k < 2u; k++) {
    for (var j = 0u; j < 2u; j++) {
      for (var i = 0u; i < 2u; i++) {
        let x = select(i0.x, i1.x, i > 0u);
        let y = select(i0.y, i1.y, j > 0u);
        let z = select(i0.z, i1.z, k > 0u);
        
        let gridIndex = x + y * GRID_SIZE + z * GRID_SIZE * GRID_SIZE;
        let finalWeight = w[i] * h[j] * d[k];
        let val = u32(intensityBase * finalWeight);
        if (val > 0u) {
          atomicAdd(&gridBuffer[gridIndex], val);
        }
      }
    }
  }
}

@compute @workgroup_size(4, 4, 4)
fn post_process(@builtin(global_invocation_id) id : vec3<u32>) {
  if (id.x >= GRID_SIZE || id.y >= GRID_SIZE || id.z >= GRID_SIZE) {
    return;
  }

  let gridIndex = id.x + id.y * GRID_SIZE + id.z * GRID_SIZE * GRID_SIZE;
  
  // Read and convert to float
  let rawVal = f32(atomicExchange(&gridBuffer[gridIndex], 0u)) / 10000.0;
  
  let color = vec4<f32>(vec3<f32>(rawVal), 1.0);
  textureStore(outTexture, id, color);
}
