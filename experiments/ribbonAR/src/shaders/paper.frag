#version 300 es

precision highp float;
in vec2 vTextureCoord;

uniform float uSeed;
uniform float uRatio;


#pragma glslify: diffuse = require(./glsl-utils/diffuse.glsl)
#pragma glslify: snoise = require(./glsl-utils/snoise.glsl)
#pragma glslify: fbm = require(./glsl-utils/fbm/3d.glsl)



out vec4 oColor;

float getHeight(vec2 uv) {
    float hScale = 2.0;
    vec3 posNoise = vec3(uv, uSeed);

    float t = 1.0;
    float base = smoothstep(-t, t, snoise(posNoise.xzy));

    float noiseScale = 4.0;
    t = 0.2;

    float nBase = smoothstep(t, 1.0-t, fbm(posNoise * noiseScale * mix(1.0, 1.2, base))) * hScale;
    noiseScale = noiseScale * 12.0;
    float nTop = smoothstep(t, 1.0-t, fbm(posNoise * noiseScale * mix(1.0, 1.2, base))) * hScale;
    return mix(nBase, nTop, 0.2);
}

void main(void) {
    vec2 uv = vTextureCoord;
    uv.y /= uRatio;

    vec3 offset = vec3(-1.0, 0.0, 1.0) * 0.001;
    

    float s11 = getHeight(uv);
    float s01 = getHeight(uv + offset.xy);
    float s21 = getHeight(uv + offset.zy);
    float s10 = getHeight(uv + offset.yx);
    float s12 = getHeight(uv + offset.yz);

    vec2 size = vec2(2.0,0.0);


    vec3 va = normalize(vec3(size.xy,s21-s01));
    vec3 vb = normalize(vec3(size.yx,s12-s10));
    // vec3 n = normalize(cross(va,vb) + fbm(vec3(uv, uSeed) * 100.0) * 0.1);
    vec3 n = normalize(cross(va,vb));

    vec3 light = vec3(0.3, 0.3, 1.0);
    float d = diffuse(n, light);
    d = mix(d, 1.0, .25);
    
    oColor = vec4(vec3(d), 1.0);
    // gl_FragColor = vec4(n, 1.0);
}