// copy.frag
#define NUM 8.0

precision highp float;
varying vec2 vTextureCoord;
varying vec2 vUV;
uniform sampler2D texture;
uniform sampler2D textureCurr;
uniform sampler2D texturePrev;
uniform float uPercent;

float contrast(float mValue, float mScale) {
    return (mValue - 0.5) * mScale + 0.5;
}

vec2 contrast(vec2 mValue, float mScale) {
    return vec2(contrast(mValue.x, mScale), contrast(mValue.y, mScale));
}


vec4 getColor(float grey) {
    vec2  uv         = contrast(vTextureCoord, 1.0);
    float mx         = step(abs(uv.x - 0.5), 0.5);
    float my         = step(abs(uv.y - 0.5), 0.5);
    float index      = floor(grey * NUM * NUM);
    float dx         = mod(index, NUM)/NUM;
    float dy         = floor(index / NUM) / NUM;
          uv         = uv / NUM + vec2(dx, dy);
    vec4  color      = texture2D(texture, uv) * mx * my;
          color.rgb *= mix(1.0, grey, .5);
    return color;
}

void main(void) {
    float curr = texture2D(textureCurr, vUV).r;
    float prev = texture2D(texturePrev, vUV).r;

    vec4 colorCurr = getColor(curr);
    vec4 colorPrev = getColor(prev);

    float t     = step(1.0 - vTextureCoord.y, uPercent);
    vec4  color = mix(colorCurr, colorPrev, t);

    gl_FragColor = color;
}