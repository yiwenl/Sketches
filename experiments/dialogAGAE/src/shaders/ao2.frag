#version 300 es
precision highp float;

in vec2 vTextureCoord;
out vec4 outColor;

uniform sampler2D uDepthMap;
uniform vec2 uScreenSize;
uniform float uRadius;

float random(vec2 coord) {
    return fract(sin(dot(coord.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

float calculateOcclusion(vec2 texCoord, float sampleRadius) {
    float occlusion = 0.0;
    float depth = texture(uDepthMap, texCoord).r;
    
    for (int i = 0; i < 16; ++i) {
        float angle = 2.0 * 3.14159265 * random(texCoord + uRadius * float(i));
        vec2 samplePoint = texCoord + vec2(cos(angle), sin(angle)) * sampleRadius;

        if (samplePoint.x < 0.0 || samplePoint.x > 1.0 || samplePoint.y < 0.0 || samplePoint.y > 1.0) {
            continue;
        }

        float sampleDepth = texture(uDepthMap, samplePoint).r;
        if (sampleDepth < depth) {
            occlusion += 1.0;
        }
    }
    
    return occlusion / 16.0;
}

void main() {
    float occlusion = calculateOcclusion(vTextureCoord, uRadius / uScreenSize.x);
    outColor = vec4(vec3(1.0 - occlusion), 1.0);
}
