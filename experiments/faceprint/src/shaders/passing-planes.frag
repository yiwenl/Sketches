// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying vec3 vColor;
varying vec3 vExtra;
uniform sampler2D textureChar;
uniform sampler2D textureColor;
uniform sampler2D textureNoise;
uniform float uTime;
uniform float uNum;
uniform float uOffset;
uniform float uShadowStrength;

#define PI 3.141592653

void main(void) {
    vec2 uv = vTextureCoord / uNum;

    vec2 uvOffset = floor(vExtra.xy * uNum) / uNum;
    uv += uvOffset;

    vec4 color = texture2D(textureChar, uv);

    uv = vTextureCoord * 0.5 + vExtra.xz * 0.5;
    float a = texture2D(textureNoise, uv).r;
    a = smoothstep(0.0, 0.5, a);
    // a = smoothstep(0.5 - r , 0.5 + r, a);
    color.rgb *= a * 1.5;

    color.a += smoothstep(0.5, 1.0, vExtra.z);
    if(color.a <= 0.01) {
        discard;
    }
    color.a = 1.0;

    float br = mix(vColor.r, 1.0, uShadowStrength);
    vec3 colorMap = texture2D(textureColor, vExtra.zx).rgb;
    color.rgb = colorMap * br;

    // float t = clamp((1.0 - uOffset) * 2.0 - vExtra.y, 0.0, 1.0);

    float s = mix(1.0, 2.0, vExtra.x) * 50.0;
    float flickering = sin(uTime * s + vExtra.y * 50.0 + cos(vExtra.z * uTime) * 20.0);

    float t = clamp(uOffset * 2.0 - vExtra.y, 0.0, 1.0);
    if(t > 0.25) {
        flickering = 1.0;
    }
    t = smoothstep(0.0, 0.05, t);


    gl_FragColor = color * 0.5 * t * flickering;
    // gl_FragColor = vec4(vec3(flickering), 1.0);
}