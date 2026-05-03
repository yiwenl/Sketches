#version 300 es

precision highp float;
in vec2 vTextureCoord;

uniform sampler2D uHeightMap;
out vec4 oColor;

void main(void) {
    ivec2 texSize = textureSize(uHeightMap, 0);
    float d = 1.0 / float(texSize.x);
    
    float height = texture(uHeightMap, vTextureCoord).r;
    float heightLeft = texture(uHeightMap, vTextureCoord + vec2(-d, 0.0)).r;
    float heightRight = texture(uHeightMap, vTextureCoord + vec2(d, 0.0)).r;
    float heightTop = texture(uHeightMap, vTextureCoord + vec2(0.0, d)).r;
    float heightBottom = texture(uHeightMap, vTextureCoord + vec2(0.0, -d)).r;

    // Calculate normal from height differences
    // X: left to right gradient
    // Y: bottom to top gradient (flipped because texture coords)
    // Z: scale factor for normal strength
    vec3 normal = normalize(vec3(
        heightLeft - heightRight,
        heightBottom - heightTop,
        2.0 * d
    ));

    // Convert normal from [-1, 1] to [0, 1] range for normal map
    oColor = vec4(normal * 0.5 + 0.5, 1.0);
}