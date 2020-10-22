// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;
attribute vec3 aPosOffset;
attribute vec3 aExtra;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uFrontMatrix;
uniform mat3 uRotateInvertMatrix;

uniform sampler2D texturePos;
uniform sampler2D textureLight;
uniform float uScale;
uniform float uOffset;
uniform float uSeed;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vColor;
varying vec3 vExtra;

#pragma glslify: curlNoise    = require(glsl-utils/curlNoise.glsl)
#pragma glslify: ease = require(glsl-easings/exponential-in-out)
// #pragma glslify: ease = require(glsl-easings/circular-in-out)


void main(void) {
    float scale = mix(2.0, 50.0, aExtra.x);
    vec3 pos = aVertexPosition * scale * uScale;

    vec3 posOffset = uRotateInvertMatrix * aPosOffset;

    vec4 screenPos = uFrontMatrix * uModelMatrix * vec4(posOffset, 1.0);
    vec2 uv = screenPos.xy / screenPos.w * .5 + .5;

    vec4 posDepth = texture2D(texturePos, uv);
    posOffset.z = posDepth.z;
    vec3 color = texture2D(textureLight, uv).rgb;
    if(posDepth.a <= 0.01) {
        pos.xy *= 0.0;
    }

    // open / close animation
    float offset = uOffset * 2.0 - aExtra.y;
    offset = ease(clamp(offset, 0.0, 1.0));

    vec3 noise = curlNoise(vec3(aPosOffset.xy * 2.5, offset * 0.5) + uSeed);
    posOffset.z += offset * 4.0;
    posOffset.xy += noise.xy * offset * 0.75;

    pos += posOffset;


    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);

    vColor = color;
    vTextureCoord = aTextureCoord;
    vNormal = aNormal;
    vExtra = aExtra;
}