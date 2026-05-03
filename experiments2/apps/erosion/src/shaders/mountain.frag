#version 300 es

precision highp float;
in vec2 vTextureCoord;
in vec3 vColor;
in float vHeight;

uniform float uMaxHeight;
uniform sampler2D uErosionMap;
uniform sampler2D uNormalMap;
out vec4 oColor;

#define COLOR_EROSION vec3(0.7, 0.8, 1.0)

#define LIGHT vec3(1.0, 1.0, 1.0)

void main(void) {
    float g = vHeight / uMaxHeight * 0.96;

    float erosion = texture(uErosionMap, vTextureCoord).r;
    erosion = abs(erosion);
    erosion = smoothstep(0.0, 0.005, erosion);

    vec3 finalColor = vec3(g) + erosion * COLOR_EROSION * 1.2;

    vec3 normal = texture(uNormalMap, vTextureCoord).rgb * 2.0 - 1.0;
    float dotNL = dot(normal, LIGHT);   
    dotNL = mix(0.7, 1.0, dotNL);
    finalColor *= dotNL;
    finalColor = pow(finalColor, vec3(1.2));

    oColor = vec4(finalColor, 1.0);
    // oColor = vec4(normal, 1.0);
}