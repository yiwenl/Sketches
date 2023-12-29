#version 300 es

precision highp float;
in vec3 aVertexPosition;
in vec2 aTextureCoord;
in vec3 aPosOffset;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform sampler2D uMap;
uniform sampler2D uDensityMap;
uniform float uTime;

out vec2 vTextureCoord;
out vec3 vNormal;
out float vDensity;
out float vAlpha;
out float vShadow;

#pragma glslify: rotate    = require(./glsl-utils/rotate.glsl)
#pragma glslify: snoise    = require(./glsl-utils/snoise.glsl)

vec3 _normalize(vec3 v) {
    if(length(v) <= 0.0) return vec3(0.0, 0.0, 0.0);
    else return normalize(v);
}

void main(void) {
    vec3 pos = aVertexPosition;

    vec4 screenPos = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosOffset.xy, 0.0, 1.0);
    vec2 uv = screenPos.xy / screenPos.w * .5 + .5;

    vec3 dir = _normalize(texture(uMap, uv).xyz);
    float angle = atan(dir.y, dir.x);

    float density = texture(uDensityMap, uv).x;
    density = smoothstep(0.0, 2.0, density);
    density = pow(density, 4.0);
    vDensity = density;
    pos *= mix(0.6, 1.0, density);

    pos.xy = rotate(pos.xy, angle);

    pos.xy += aPosOffset.xy + aPosOffset.z * 0.01;

    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
    vTextureCoord = aTextureCoord;

    float n = snoise( vec3(aPosOffset.xy * 0.2, uTime * 0.5)) * .5 + .5;
    vAlpha = smoothstep(0.2, .8, n);
    vShadow = aPosOffset.z;
}