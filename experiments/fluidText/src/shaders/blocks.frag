// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying vec2 vUV;
varying vec3 vExtra;
uniform sampler2D uMap;
uniform sampler2D uCharMap;
uniform float uNumChars;
uniform float uTime;

#define uvScale 1.0/16.0

void main(void) {
    float r = texture2D(uMap, vUV).r / 100.0;

    float index = floor(r * 50.0);
    float x = mod(index, 16.0) / 16.0;
    float y = floor(index / 16.0) / 16.0;
    vec2 charUV = vec2(x, y) + vTextureCoord * uvScale;
    float color = texture2D(uCharMap, charUV).r;


    float time = mod(uTime * mix(1.0, 3.0, vExtra.x) * 0.01 + vExtra.y, 1.0);
    if(time < 0.1) {
        color = 1.0 - color;
    }

    // gl_FragColor = vec4(vec3(r), 1.0);
    gl_FragColor = vec4(vec3(color), 1.0);
    // gl_FragColor = color;
}