// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform vec3 uColor0;
uniform vec3 uColor1;
uniform float uTime;
uniform vec2 uViewport;
uniform sampler2D uColorMap;

varying vec3 vColor;

#pragma glslify: curlNoise    = require(./glsl-utils/curlNoise.glsl)
#pragma glslify: particleSize    = require(./glsl-utils/particleSize.glsl)

#define radius 0.005

void main(void) {

    float time = fract(uTime * mix(1.0, 4.0, aNormal.x) * 0.05 + aNormal.y);

    vec3 pos = aVertexPosition;
    pos += curlNoise(pos * 0.2 + time * 0.1) * 2.0 + time * 2.0;

    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);

    float scale = mix(1.0, 3.0, aTextureCoord.x);
    float scaleLife = smoothstep(0.5, .4, abs(time - 0.5));
    gl_PointSize = particleSize(gl_Position, uProjectionMatrix, uViewport, radius) * scale * scaleLife; 

    vec2 uv = fract(aTextureCoord + aNormal.xy);
    vec3 color = texture2D(uColorMap, uv).rgb;

    // vColor = mix(uColor0, uColor1, step(aTextureCoord.y, .5)) * mix(.5, 1.0, aNormal.z);
    vColor = color * mix(.5, 1.0, aNormal.z);
}