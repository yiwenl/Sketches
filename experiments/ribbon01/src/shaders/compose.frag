#version 300 es

precision highp float;
in vec2 vTextureCoord;
uniform sampler2D uMap;
uniform sampler2D uBlurMap;
uniform float uRatio;

out vec4 oColor;

void main(void) {
    vec4 color = texture(uMap, vTextureCoord);
    vec4 blurColor = texture(uBlurMap, vTextureCoord);
    vec2 uv = vTextureCoord - .5;
    

    if(uRatio < 1.0) {
        uv.x *= uRatio;
    } else {
        uv.y /= uRatio;
    }

    float d = length(uv);

    float v = smoothstep(0.6, 0.2, d);
    v = mix(0.6, 1.1, v);

    d = smoothstep(0.2, 0.4, d);

    color = mix(color, blurColor, d);
    color.rgb *= v;
    oColor = color;
}