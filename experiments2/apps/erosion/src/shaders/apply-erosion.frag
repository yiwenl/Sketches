#version 300 es

precision highp float;
in vec2 vTextureCoord;

uniform sampler2D uHeightMap;
uniform sampler2D uErosionMap;
uniform float uSeaLevel;

out vec4 oColor;

void main(void) {
    float height = texture(uHeightMap, vTextureCoord).r;
    float erosion = texture(uErosionMap, vTextureCoord).r;  

    float newHeight = max(uSeaLevel, height - erosion);
    // float newHeight = height - erosion;

    oColor = vec4(vec3(newHeight), 1.0);
}