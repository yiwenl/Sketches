struct Drop {
    pos: vec2<f32>,
    dir: vec2<f32>,
    vel: f32,
    water: f32,
    sediment: f32,
};

struct Uniforms {
    uSize: f32,
    uInertia: f32,
    uGravity: f32,
    uCapacity: f32,
    uMaxCapacity: f32,
    uEvaporation: f32,
    uErosionRate: f32,
    uDepositionRate: f32,
    uMinSlope: f32,
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var<storage, read_write> heightMap: array<f32>;
@group(0) @binding(2) var<storage, read_write> drops: array<Drop>;

// Fetch height from our 1D array using 2D continuous coordinates via bilinear interpolation
fn getHeightAndGradient(pos: vec2<f32>) -> vec3<f32> {
    let size = i32(uniforms.uSize);
    let x = i32(pos.x);
    let z = i32(pos.y);

    let u = pos.x - f32(x);
    let v = pos.y - f32(z);

    // Bounds checking
    let x0 = clamp(x, 0, size - 1);
    let z0 = clamp(z, 0, size - 1);
    let x1 = clamp(x + 1, 0, size - 1);
    let z1 = clamp(z + 1, 0, size - 1);

    // Heights at 4 corners
    let h00 = heightMap[z0 * size + x0];
    let h10 = heightMap[z0 * size + x1];
    let h01 = heightMap[z1 * size + x0];
    let h11 = heightMap[z1 * size + x1];

    // Bilinear interpolation for height
    let h0 = mix(h00, h10, u);
    let h1 = mix(h01, h11, u);
    let height = mix(h0, h1, v);

    // Gradients
    let gradX = mix(h10 - h00, h11 - h01, v);
    let gradZ = mix(h01 - h00, h11 - h10, u);

    return vec3<f32>(height, gradX, gradZ);
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    let index = id.x;
    var drop = drops[index];
    let size = uniforms.uSize;

    // Simulate for max 30 steps or until water evaporates/runs off edge
    for(var step = 0; step < 30; step++) {
        let pos = drop.pos;

        // Stop if off map (check before truncation!)
        if (pos.x < 0.0 || pos.x >= size - 1.0 || pos.y < 0.0 || pos.y >= size - 1.0) {
            break;
        }

        let pIndexX = i32(pos.x);
        let pIndexZ = i32(pos.y);

        let hg = getHeightAndGradient(pos);
        let height = hg.x;
        var dir = drop.dir;

        // Calculate new direction
        dir.x = dir.x * uniforms.uInertia - hg.y * (1.0 - uniforms.uInertia);
        dir.y = dir.y * uniforms.uInertia - hg.z * (1.0 - uniforms.uInertia);
        
        let dirLen = length(dir);
        if (dirLen > 0.0) {
            dir = dir / dirLen; // Always normalize
        } else {
            // Random direction if completely flat
            let seed = vec2<f32>(f32(index), drop.pos.x * drop.pos.y + f32(step));
            let angle = fract(sin(dot(seed, vec2<f32>(12.9898, 78.233))) * 43758.5453) * 6.2831853;
            dir = vec2<f32>(cos(angle), sin(angle));
        }

        drop.dir = dir;

        // Move the drop. Since we fixed the gravity physics, normal velocity drives it.
        // Cap at 1.0 just to prevent skipping over cells completely if gravity is set wildly high
        let moveSpeed = min(drop.vel, 1.0); 
        drop.pos = drop.pos + (dir * moveSpeed);

        // Get height at new pos
        let newHg = getHeightAndGradient(drop.pos);
        let newHeight = newHg.x;
        let deltaHeight = newHeight - height;

        // Sediment capacity
        let c = max(-deltaHeight, uniforms.uMinSlope) * drop.vel * drop.water * uniforms.uCapacity;
        let capacity = clamp(c, 0.0, uniforms.uMaxCapacity);

        // When applying the brush, anchor it to the TOP-LEFT floor node, just as our height maps do.
        // We calculate precise fractional sub-pixel distance from the drop to each integer target.
        let u = fract(pos.x);
        let v = fract(pos.y);

        // Compute 3x3 circular brush weights
        var weightSum = 0.0;
        var weights: array<f32, 9>;
        var flatIndices: array<i32, 9>;
        
        var iter = 0;
        
        // Loop over the 3x3 block relative to floor(pos)
        // dx, dz shift around the integer grid [0,0]
        for(var dz = -1; dz <= 1; dz++) {
            for(var dx = -1; dx <= 1; dx++) {
                let cellX = pIndexX + dx;
                let cellZ = pIndexZ + dz;
                
                // clamp indices
                let cx = clamp(cellX, 0, i32(size) - 1);
                let cz = clamp(cellZ, 0, i32(size) - 1);
                
                // Real distance from the exact droplet float position
                // (dx, dz) is the integer offset, (u, v) is the droplet fraction
                let dist = length(vec2<f32>(f32(dx) - u, f32(dz) - v));
                
                // Classic HansTheobald smooth erosion bell
                let w = max(0.0, 1.0 - dist);
                
                weights[iter] = w;
                flatIndices[iter] = cz * i32(size) + cx;
                weightSum += w;
                iter++;
            }
        }

        // Deposit or erode
        if (drop.sediment > capacity || deltaHeight > 0.0) {
            // Deposit
            let deposit = select(
                (drop.sediment - capacity) * uniforms.uDepositionRate,
                min(drop.sediment, deltaHeight),
                deltaHeight > 0.0
            );
            drop.sediment -= deposit;

            for(var i = 0; i < 9; i++) {
                let w = weights[i] / max(weightSum, 0.0001);
                let idx = flatIndices[i];
                heightMap[idx] += deposit * w;
            }

        } else {
            // Erode
            let erosionAmount = min((capacity - drop.sediment) * uniforms.uErosionRate, -deltaHeight);
            
            // Apply minimum slope falloff to prevent complete flattening
            let slopeFactor = smoothstep(0.0, uniforms.uMinSlope * 2.0, -deltaHeight);
            let erosion = erosionAmount * slopeFactor;
            
            drop.sediment += erosion;

            for(var i = 0; i < 9; i++) {
                let w = weights[i] / max(weightSum, 0.0001);
                let idx = flatIndices[i];
                heightMap[idx] = max(heightMap[idx] - erosion * w, 0.0);
            }
        }

        // Update velocity and water
        // friction slows it down, downhill accelerates, uphill decelerates
        let friction = 0.05; 
        drop.vel = drop.vel * (1.0 - friction);
        drop.vel = sqrt(max(drop.vel * drop.vel - deltaHeight * uniforms.uGravity, 0.0));
        drop.water = drop.water * (1.0 - uniforms.uEvaporation);

        if (drop.water < 0.01) {
            break;
        }
    }

    // End of drop life: Reset to random position (for continuous simulation)
    if(drop.water < 0.01 || drop.pos.x < 0.0 || drop.pos.x >= size - 1.0 || drop.pos.y < 0.0 || drop.pos.y >= size - 1.0) {
        // Simple pseudo-random using drop index and time/pos
        let seed = vec2<f32>(f32(index), drop.pos.x * drop.pos.y);
        drop.pos = vec2<f32>(
            fract(sin(dot(seed, vec2<f32>(12.9898, 78.233))) * 43758.5453) * (size - 1.0),
            fract(sin(dot(seed, vec2<f32>(39.346, 11.135))) * 43758.5453) * (size - 1.0)
        );
        drop.dir = vec2<f32>(0.0, 0.0);
        drop.vel = 1.0;
        drop.water = 1.0;
        drop.sediment = 0.0;
    }

    drops[index] = drop;
}
