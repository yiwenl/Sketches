#version 300 es

precision highp float;
in vec3 aVertexPosition;
in vec2 aTextureCoord;
in vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uShadowMatrix;
uniform mat4 uLocalMatrix;

uniform sampler2D uPosMap;
uniform vec2 uViewport;
uniform float uOffset;

out vec3 vColor;
out vec4 vShadowCoord;
out float vDiscard;

#pragma glslify: rotate    = require(./glsl-utils/rotate.glsl)
#pragma glslify: particleSize    = require(./glsl-utils/particleSize.glsl)

#define radius 0.01

void main(void) {
    vec4 colorPos = texture(uPosMap, aTextureCoord); 
    vec3 pos = colorPos.xyz;
    pos.y -= 1.0;
    float _discard = 0.0;
    if(colorPos.a < 0.01) {
        _discard = 1.0;
    }
    if(length(pos.xz) < 0.02) {
        _discard = 1.0;
    }

    float offset = distance(aTextureCoord, vec2(0.5));
    offset = smoothstep(0.3, 0.5, offset);

    offset = pow(offset, 3.0) * 2.0;
    
    pos.xy += (fract(aVertexPosition.xy + aVertexPosition.yz) - 0.5) * offset;

    vec4 wsPos = uModelMatrix * vec4(pos, 1.0);
    gl_Position = uProjectionMatrix * uViewMatrix * uLocalMatrix * wsPos;

    float scale = mix(0.25, 0.7, aVertexPosition.x);
    gl_PointSize = particleSize(gl_Position, uProjectionMatrix, uViewport, radius) * scale;


    vShadowCoord = uShadowMatrix * wsPos;

    float g = mix(.7, 1.0, aVertexPosition.z);
    vColor = vec3(g);
    vDiscard = _discard;
}