// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying vec3 vColor;
varying vec3 vExtra;
uniform sampler2D texture;
uniform sampler2D texturePrev;
uniform sampler2D textureCurr;
uniform float uOffset;

#define NUM 16.0

void main(void) {
    float s = mix(0.1, 0.4, vExtra.y);
    s = 2.0/16.0;
    vec2 uv = vTextureCoord * s + floor(vExtra.zx * NUM) / NUM;

    vec4 color = texture2D(texture, uv);
    vec4 prev = texture2D(texturePrev, vExtra.zy);
    vec4 curr = texture2D(textureCurr, vExtra.zy);
    vec4 colorMap = mix(prev, curr, uOffset);

    color.rgb *= colorMap.rgb;

    color.rgb = mix(color.rgb, vec3(0.0), .5);

    gl_FragColor = color;
}