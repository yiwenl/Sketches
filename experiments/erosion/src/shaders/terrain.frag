#version 300 es
precision highp float;

// Uniforms
uniform sampler2D uHeightMap; // The height map texture
uniform vec2 uTextureSize;    // Size of the texture (width, height)
uniform float uHeightScale;   // A scaling factor for the height

// Inputs
in vec2 vTextureCoord; // Texture coordinates

#pragma glslify: diffuse    = require(./glsl-utils/diffuse.glsl)
#define LIGHT vec3(1.0, 0.8, 0.6)

// Outputs
out vec4 fragColor;

void main() {
    // Sample the height map at the current position
    float heightCenter = texture(uHeightMap, vTextureCoord).r;

    // Calculate the step size for neighboring pixels
    vec2 stepSize = 1.0 / uTextureSize;

    // Sample the height map at neighboring positions
    float heightRight = texture(uHeightMap, vTextureCoord + vec2(stepSize.x, 0.0)).r;
    float heightUp    = texture(uHeightMap, vTextureCoord + vec2(0.0, stepSize.y)).r;

    // Calculate the gradients
    vec3 dx = vec3(1.0, (heightRight - heightCenter) * uHeightScale, 0.0);
    vec3 dy = vec3(0.0, (heightUp - heightCenter) * uHeightScale, 1.0);

    // Calculate the normal
    vec3 normal = normalize(cross(dy, dx));

    // Set the fragment color
    fragColor = vec4(normal * 0.5 + 0.5, 1.0); // Normalized to 0-1 range for visualization

    float d = diffuse(normal, LIGHT);

    fragColor = vec4(d, d, d, 1.0);
}
