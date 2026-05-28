#version 300 es

precision highp float;
in vec3 aVertexPosition;
in vec3 aVertexLodPosition;
in vec2 aTextureCoord;

in vec3 aInstancePosition;
in vec3 aInstanceSeed;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform float uOffset;

uniform sampler2D uCurlMap;
uniform float uFieldSize;
uniform float uMaxFloorHeight;

out vec2 vTextureCoord;
out vec3 vSeed;

void main(void) {
    vec3 pos = mix(aVertexLodPosition, aVertexPosition, uOffset);

    // Map instance XZ from [-uFieldSize, uFieldSize] → [0, 1] to sample the height map
    vec2 uv = (aInstancePosition.xz + uFieldSize) / (2.0 * uFieldSize);
    float elevation = texture(uCurlMap, uv).r * uMaxFloorHeight;

    vec3 instancePos = aInstancePosition + vec3(0.0, elevation, 0.0);
    pos += instancePos;

    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
    vTextureCoord = aTextureCoord;
    vSeed = aInstanceSeed;
}
