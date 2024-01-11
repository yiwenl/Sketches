#version 300 es

precision highp float;
in vec2 vTextureCoord;
uniform sampler2D uMap;
uniform sampler2D uNoiseMap;
uniform float uRatio;

out vec4 oColor;

void main(void) {
    vec2 uv = vTextureCoord - .5;
    if(uRatio < 1.0) {
        uv.x *= uRatio;
    } else {
        uv.y /= uRatio;
    }

    float noise = texture(uNoiseMap, uv * 4.0).r;

    float d = length(uv);
    float vignette = smoothstep(0.7, 0.2, d);
    vignette = mix(0.5, 1.2, vignette);

    vec4 color = texture(uMap, vTextureCoord);
    color.rgb *= vignette;
    float noiseAmount = smoothstep(0.1, 0.6, d);
    color.rgb -= noiseAmount * 0.1;

    // highlight / shadow
    float highlight = distance(uv, vec2(-0.2, 0.2));
    highlight = smoothstep(.8, 0.2, highlight);
    highlight = mix(0.7, 1.1, highlight);

    color.rgb *= highlight;
    // color.rgb = vec3(highlight);

    oColor = color;
}