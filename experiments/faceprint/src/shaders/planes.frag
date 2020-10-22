// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying vec3 vColor;
varying vec3 vExtra;
uniform sampler2D textureChar;
uniform sampler2D textureColor;
uniform sampler2D textureNoise;
uniform float uNum;
uniform float uShadowStrength;

void main(void) {
    vec2 uv = vTextureCoord / uNum;

    vec2 uvOffset = floor(vExtra.xy * uNum) / uNum;
    uv += uvOffset;

    vec4 color = texture2D(textureChar, uv);

    uv = vTextureCoord * 0.5 + vExtra.xz * 0.5;
    float a = texture2D(textureNoise, uv).r;
    a = smoothstep(0.0, 0.5, a);
    color.rgb *= a * 1.5;

    if(color.a <= 0.05) {
        discard;
    }
    color.a = 1.0;

    float br = mix(vColor.r, 1.0, uShadowStrength);
    vec3 colorMap = texture2D(textureColor, vExtra.zx).rgb;
    color.rgb *= colorMap * br;

    gl_FragColor = color;
}