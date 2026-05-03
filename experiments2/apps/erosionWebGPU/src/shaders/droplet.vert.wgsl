struct Uniforms {
    uViewProjectionMatrix: mat4x4<f32>,
    uModelMatrix: mat4x4<f32>,
    uSize: f32,
    uLength: f32,
};

struct Drop {
    pos: vec2<f32>,
    dir: vec2<f32>,
    vel: f32,
    water: f32,
    sediment: f32,
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(2) var<storage, read> heightMap: array<f32>;
@group(0) @binding(3) var<storage, read> drops: array<Drop>;

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
};

var<private> quadVertices: array<vec2<f32>, 6> = array<vec2<f32>, 6>(
    vec2<f32>(-0.5, -0.5),
    vec2<f32>( 0.5, -0.5),
    vec2<f32>(-0.5,  0.5),
    vec2<f32>(-0.5,  0.5),
    vec2<f32>( 0.5, -0.5),
    vec2<f32>( 0.5,  0.5)
);

@vertex fn main(@builtin(vertex_index) vertexIndex: u32, @builtin(instance_index) instanceIndex: u32) -> VertexOutput {
    var output: VertexOutput;
    
    // Each instance represents one drop.
    let drop = drops[instanceIndex];

    let size = uniforms.uSize;
    let step = uniforms.uLength / (size - 1.0);
    let halfLength = uniforms.uLength / 2.0;

    let px = (drop.pos.x * step) - halfLength;
    let pz = (drop.pos.y * step) - halfLength;
    
    // Fetch nearest height so they sit cleanly on top
    let cx = clamp(i32(drop.pos.x), 0, i32(size) - 1);
    let cz = clamp(i32(drop.pos.y), 0, i32(size) - 1);
    let py = heightMap[cz * i32(size) + cx];

    // Lift them up slightly so they don't z-fight with the terrain
    let centerWorldPosition = uniforms.uModelMatrix * vec4<f32>(px, py + 0.3, pz, 1.0);
    let clipPos = uniforms.uViewProjectionMatrix * centerWorldPosition;
    
    // Generate camera-facing billboard quad
    let dropScale = 0.5; // Fixed size in perspective clip space
    let quadPos = quadVertices[vertexIndex] * dropScale;
    output.position = clipPos + vec4<f32>(quadPos.x, quadPos.y, 0.0, 0.0);
    
    return output;
}
