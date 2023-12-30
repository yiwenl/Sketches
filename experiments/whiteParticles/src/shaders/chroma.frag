#version 300 es

precision highp float;
in vec2 vTextureCoord;
uniform sampler2D uMap;
uniform sampler2D uNormalMap;
uniform sampler2D uAOMap;
uniform vec3 uColorAO;

out vec4 oColor;

#define colorCyan vec3(99.0, 170.0, 237.0)/255.0
#define colorMagenta vec3(206.0, 14.0, 140.0)/255.0
#define colorYellow vec3(250.0, 245.0, 46.0)/255.0


vec3 greyscale(vec3 color, float str) {
    float g = dot(color, vec3(0.299, 0.587, 0.114));
    return mix(color, vec3(g), str);
}

vec3 greyscale(vec3 color) {
    return greyscale(color, 1.0);
}

void main(void) {
    vec3 n = texture(uNormalMap, vTextureCoord).rgb * 2.0 - 1.0;
    vec2 uv = vTextureCoord;

    float ao = texture(uAOMap, vTextureCoord).r;
    vec3 colorAO = mix(uColorAO, vec3(1.0), ao);

    vec2 off = n.rb * 0.0025;
    off *= 2.0;

    vec3 color0 = texture(uMap, uv-off).rgb * colorAO * vec3(1.0, 0.0, 0.0);
    vec3 color1 = texture(uMap, uv+off).rgb * colorAO * vec3(0.0, 1.0, 0.0);
    vec3 color2 = texture(uMap, uv).rgb * colorAO * vec3(0.0, 0.0, 1.0);

    vec3 color = greyscale(color0 + color1 + color2, .6);

    color *= mix(colorAO, vec3(1.0), .85);
    uv.y = 1.0 - uv.y;
    float d = length(uv);
    d = smoothstep(0.25, 1.2, d);
    // vec3 colorAdj = mix(vec3(1.0), vec3(1.0, .97, .94) * 0.85, d);
    vec3 colorAdj = mix(vec3(1.0), vec3(.5), d);
    // color *= colorAdj;
    color -= d * 0.4;

    oColor = vec4(color, 1.0);
}