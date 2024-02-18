#version 300 es

precision highp float;
in vec3 aVertexPosition;
in vec2 aTextureCoord;
in vec3 aOffset;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform float uMargin;
uniform float uRatio;

uniform sampler2D uGradientMap;
uniform sampler2D uNoiseMap;

out vec2 vTextureCoord;
out float vSkip;
out float vGrey;
out vec3 vColor;
#pragma glslify: rotate    = require(./glsl-utils/rotate.glsl)

void main(void) {
    vec3 pos = aVertexPosition;
    pos.xy += aOffset.xy;
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
    vTextureCoord = aTextureCoord;


    // skipping
    vec4 p = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aOffset.xy, 0.0, 1.0);
    p.xy /= p.w;

    float skip = 0.0;
    if(p.x > 1.0 - uMargin || p.x < -1.0 + uMargin) {
        skip = 1.0;
    }
    if(p.y > 1.0 - uMargin*uRatio || p.y < -1.0 + uMargin*uRatio) {
        skip = 1.0;
    }

    vSkip = skip;
    vec2 uvFluid = p.xy * .5 + .5;

    if(uRatio > 1.0) {
        p.y /= uRatio;
    } else {
        p.x *= uRatio;

    }
    vec2 uv = p.xy * 0.5 + 0.5;
    float grey = texture(uGradientMap, uvFluid).r;
    float noise = texture(uNoiseMap, uv).r;
    grey += noise * 0.7 * (1.0 - grey);
    grey = smoothstep(0.0, 0.8, grey);
    
    vGrey = grey;
}