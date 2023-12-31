#version 300 es

precision highp float;
in vec2 vTextureCoord;
uniform sampler2D uMap;
uniform sampler2D uNormalMap;
uniform sampler2D uAOMap;
uniform vec3 uColorAO;
uniform float uRatio;

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


vec2 getStretchedUV(vec2 uv, float scale, float front) {
    float d;
    float t;
    vec2 stretchedUV;
    vec2 _uv = uv - 0.5;

    if(uRatio < 1.0) {
        _uv.x *= uRatio;
    } else {
        _uv.y /= uRatio;
    }
    d = length(_uv);
    d = abs(d - front);
    t = smoothstep(0.1, 0.0, d) * scale * .75;
    stretchedUV = 0.5 + (uv - 0.5) * ( 1.0 + t);
    return stretchedUV;
}

void main(void) {
    vec3 n = texture(uNormalMap, vTextureCoord).rgb * 2.0 - 1.0;
    vec2 uv = vTextureCoord;

    float d;
    float ao = texture(uAOMap, vTextureCoord).r;
    vec3 colorAO = mix(uColorAO, vec3(1.0), ao);

    vec2 off = n.rb * 0.0025;
    off *= 2.0;

    float front = 0.15;
    float scale = 0.25;

    uv = getStretchedUV(vTextureCoord, scale, front);
    vec3 color = texture(uMap, uv).rgb;

    front = 0.2;
    scale = 0.025;

    float t = 0.1;
    vec3 color0 = vec3(1.0 - t * 2.0, t, t);
    vec3 color1 = vec3(t, 1.0 - t * 2.0, t);
    vec3 color2 = vec3(t, t, 1.0 - t * 2.0);

    vec2 uv2 = getStretchedUV(uv, scale, front);
    vec3 r = texture(uMap, uv2).rgb * color0;
    vec3 g = texture(uMap, uv).rgb * color1;
    uv2 = getStretchedUV(uv, -scale, front);
    vec3 b = texture(uMap, uv2).rgb * color2;
    color = r + g + b;


    color *= mix(colorAO, vec3(1.0), .85);


    
    // dark bottom right
    uv = vTextureCoord;
    uv.y = 1.0 - uv.y;
    d = length(uv);
    d = smoothstep(0.25, 1.2, d);
    color -= d * 0.5;

    oColor = vec4(color, 1.0);
}