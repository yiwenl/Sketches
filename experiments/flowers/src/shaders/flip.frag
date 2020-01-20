#define NUM 8.0
#define BLACK vec4(0.0, 0.0, 0.0, 1.0)

precision highp float;
varying vec2 vTextureCoord;
varying vec2 vUVOffset;
uniform sampler2D texture;
uniform sampler2D textureMap;

float contrast(float mValue, float mScale) {
    return (mValue - 0.5) * mScale + 0.5;
}

vec2 contrast(vec2 mValue, float mScale) {
    return vec2(contrast(mValue.x, mScale), contrast(mValue.y, mScale));
}

void main(void) {

    float grey = texture2D(textureMap, vUVOffset).r;

    vec2 uv = contrast(vTextureCoord, 1.1);
    float mx = step(abs(uv.x - 0.5), 0.5);
    float my = step(abs(uv.y - 0.5), 0.5);

    float index = 10.0;
    index = floor(grey * NUM * NUM);
    float dx = mod(index, NUM)/NUM;
    float dy = floor(index / NUM) / NUM;
    uv = uv / NUM + vec2(dx, dy);

    if(gl_FrontFacing) {
        vec4 bg = vec4(vec3(grey), 1.0);
        gl_FragColor = texture2D(texture, uv) * mx * my;
        gl_FragColor.rgb *= mix(grey, 1.0, .5);
        // gl_FragColor = mix(bg, gl_FragColor, .5);
    } else {
        gl_FragColor = BLACK;
    }
}