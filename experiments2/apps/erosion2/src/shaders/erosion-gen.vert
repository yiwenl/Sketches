#version 300 es

precision highp float;
in vec3 aVertexPosition;
in vec3 aPosOffset;
in vec2 aTextureCoord;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform float uMapSize;
uniform sampler2D uPosMap;
uniform sampler2D uVelMap;
uniform sampler2D uDebugMap;

out vec2 vTextureCoord;
out float vSediment;

void main(void) {
    vec3 pos = aVertexPosition;
    pos *= aPosOffset.z;

    vec3 dataPos = texture(uPosMap, aPosOffset.xy).xyz;
    vec3 dataVel = texture(uVelMap, aPosOffset.xy).xyz;

    vec2 posOffset = dataPos.xy;
    float water = dataPos.z;
    float sediment = dataVel.z;
    pos.xy += posOffset;

    pos.xy = pos.xy / uMapSize;

    vSediment = sediment;

    gl_Position = vec4(pos, 1.0);
    vTextureCoord = aTextureCoord;
}