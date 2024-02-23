#version 300 es

precision highp float;
in vec2 vTextureCoord;
uniform sampler2D uMap;
uniform sampler2D uFaceMap;
uniform float uBound;

out vec4 oColor;

void main(void) {
    vec3 pos = texture(uMap, vTextureCoord).xyz;

    // face bound
    vec2 uv = pos.xy / uBound * .5 + .5;
    vec4 colorFace = texture(uFaceMap, uv);
    float maxDepth = colorFace.z + 0.8;
    if(colorFace.a > 0.0) {
        // maxDepth = 0.0;
        pos.z = min(maxDepth, pos.z);
    }

    oColor = vec4(pos, 1.0);
}