struct Uniforms {
    uViewProjectionMatrix: mat4x4<f32>,
    uModelMatrix: mat4x4<f32>,
    uSize: f32,
    uLength: f32,
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(2) var<storage, read> heightMap: array<f32>;

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) vWorldPosition: vec3<f32>,
    @location(1) vNormal: vec3<f32>,
};

fn getPosition(x: f32, z: f32) -> vec3<f32> {
    let size = uniforms.uSize;
    let step = uniforms.uLength / (size - 1.0);
    let halfLength = uniforms.uLength / 2.0;

    let px = (x * step) - halfLength;
    let pz = (z * step) - halfLength;
    
    // Safety clamp (though indices should prevent out of bounds)
    let cx = clamp(i32(x), 0, i32(size) - 1);
    let cz = clamp(i32(z), 0, i32(size) - 1);
    let py = heightMap[cz * i32(size) + cx];

    return vec3<f32>(px, py, pz);
}

@vertex fn main(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
    var output: VertexOutput;
    
    // We expect the pipeline to draw indices, but since we have no vertex buffer,
    // WebGPU allows us to just pass in the Index Buffer and read `vertex_index`.
    let size = uniforms.uSize;
    
    // The provided index is the flattened 1D array index
    let z = floor(f32(vertexIndex) / size);
    let x = f32(vertexIndex) % size;
    
    let pC = getPosition(x, z);
    // Central differences for robust normal calculation
    let pL = getPosition(x - 1.0, z);
    let pR = getPosition(x + 1.0, z);
    let pD = getPosition(x, z - 1.0);
    let pU = getPosition(x, z + 1.0);
    
    // Cross product to get upward-pointing normal
    let normal = normalize(cross(pU - pD, pR - pL));

    let worldPosition = uniforms.uModelMatrix * vec4<f32>(pC, 1.0);
    output.vWorldPosition = worldPosition.xyz;
    
    output.vNormal = (uniforms.uModelMatrix * vec4<f32>(normal, 0.0)).xyz;
    output.position = uniforms.uViewProjectionMatrix * worldPosition;
    
    return output;
}
