#version 300 es

precision highp float;
in vec3 aVertexPosition; // Vertices defining the small quad (e.g., from -0.0005 to 0.0005)
in vec2 aTextureCoord;   // UV for reading droplet map
in vec2 aUV;             // UV to pass to the fragment shader for splat lookup

uniform sampler2D uDropletsMap;
uniform sampler2D uSedimentMap;
uniform float uMapSize;             // Half domain size (e.g., 3.0)

out vec2 vTextureCoord;
out float vSediment;

void main(void) {
    float sediment = texture(uSedimentMap, aUV).r;

    // 1. Read Droplet Position (pos_sim is in [-uMapSize, uMapSize])
    vec2 pos_sim = texture(uDropletsMap, aUV).xy;

    
    // 2. Convert Simulation Position to NDC (pos_ndc is in [-1.0, 1.0])
    // pos_sim / uMapSize -> [-1.0, 1.0]
    vec2 pos_ndc = pos_sim / uMapSize; 

    // 3. Position the Splat Quad
    
    // The quad vertices (aVertexPosition.xy) are already scaled small (e.g., +/- 0.0005)
    // Add the small local offset directly to the droplet's NDC position.
    vec2 final_pos = pos_ndc + aVertexPosition.xy;

    // 4. Set final screen position
    gl_Position = vec4(final_pos, 0.0, 1.0);
    
    // 5. Pass along the vertex coordinates for the fragment shader splat lookup
    // aUV is the unique index of the droplet being processed.
    // vTextureCoord should pass the *local* coordinates of the quad for the Gaussian function.
    
    // Assuming aVertexPosition covers a small NDC area around the origin.
    // We need to remap this small range back to the [0.0, 1.0] UV range for the fragment shader.
    
    // If the quad is 0.001 wide, its range is e.g., [-0.0005, 0.0005].
    // This part requires careful tuning based on your geometry implementation:
    
    vTextureCoord = aTextureCoord;
}