#version 300 es

precision highp float;
in vec2 vTextureCoord;
uniform sampler2D uMap;
uniform sampler2D uNormalMap;
uniform sampler2D uAOMap;
uniform vec3 uColorAO;

out vec4 oColor;

void main(void) {
    vec3 n = texture(uNormalMap, vTextureCoord).rgb * 2.0 - 1.0;


    float s = 0.2;
    vec2 uv = vTextureCoord + n.rb * 0.05 * s;
    // uv = vTextureCoord + vec2(0.05 * s, 0.0);
    float r = texture(uMap, uv).r;
    uv = vTextureCoord;
    float g = texture(uMap, uv).g;
    uv = vTextureCoord - n.xy * 0.05 * s;
    float b = texture(uMap, uv).b;


    float t = 0.0;

    vec3 colorR = vec3(1.0 - t * 2.0, t, t);
    vec3 colorG = vec3(t, 1.0 - t * 2.0, t);
    vec3 colorB = vec3(t, t, 1.0 - t * 2.0);

    vec3 color = colorR * r + colorG * g + colorB * b;

    float ao = texture(uAOMap, vTextureCoord).r;
    vec3 colorAO = mix(uColorAO, vec3(1.0), ao);
    // ao = mix(ao, 1.0, .7);
    color *= colorAO;

    // color *= vec3(1.0, .97, .94);

    oColor = vec4(color, 1.0);
    // oColor = vec4(n.rb, 0.0, 1.0);
}