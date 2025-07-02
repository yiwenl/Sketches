#version 300 es

precision highp float;
in vec2 vTextureCoord;
uniform sampler2D uMap;
uniform sampler2D uAoMap;
uniform float uAoStrength;
uniform float uRatio;

out vec4 oColor;

void main(void) {
    vec4 color = texture(uMap, vTextureCoord);
    float ao = texture(uAoMap, vTextureCoord).r;
    ao = mix(1.0, ao, uAoStrength); 

    color.rgb *= ao;

    // vignette
    vec2 c = vec2(-0.1, 0.05);
    vec2 uv = vTextureCoord - 0.5;

    if(uRatio < 1.0) {
        uv.x *= uRatio;
    } else {
        uv.y /= uRatio;
    }
    float d = distance(c, uv);
    float vignette = smoothstep(0.7, 0.3, d);
    vignette = mix(0.4, 1.0, vignette);
    color.rgb *= vignette;


    oColor = color;
    // oColor = vec4(vec3(vignette), 1.0);
}