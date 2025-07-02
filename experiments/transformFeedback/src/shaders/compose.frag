#version 300 es

precision highp float;
in vec2 vTextureCoord;
uniform sampler2D uPosMap;
uniform sampler2D uNormalMap;
uniform sampler2D uRandomMap;
uniform sampler2D uLightMap;
uniform sampler2D uMap;
uniform sampler2D uColorMap0;
uniform sampler2D uColorMap1;
uniform sampler2D uColorMap2;
uniform sampler2D uColorMap3;

out vec4 oColor;

void main(void) {
    vec4 pos = texture(uPosMap, vTextureCoord);
    vec3 normal = texture(uNormalMap, vTextureCoord).xyz;
    vec3 random = texture(uRandomMap, vTextureCoord).xyz;
    vec3 light = texture(uLightMap, vTextureCoord).xyz;
    float shadow = light.x;
    float diffuse = light.y;

    float map = texture(uMap, vTextureCoord).x;

    vec2 uv = random.xy;

    float index = fract(map) * 4.0;

    vec3 color;
    if(index < 0.5) {
        color = texture(uColorMap0, uv).xyz;
    } else if(index < 1.5) {
        color = texture(uColorMap1, uv).xyz;
    } else if(index < 2.5) {
        color = texture(uColorMap2, uv).xyz;
    } else {
        color = texture(uColorMap3, uv).xyz;
    }

    float s = shadow * diffuse;
    s = mix(0.2, 1.0, s);
    color = pow(color + 0.2, vec3(1.2)) * 1.3;
    color *= s;

    oColor = vec4(color, pos.a);
    // oColor = vec4(uv, 0.0, 1.0);
    // oColor = vec4(vec3(index/4.0 + 0.5/4.0), 1.0);
    // oColor = pos;
    // oColor = texture(uMap, vTextureCoord);
}