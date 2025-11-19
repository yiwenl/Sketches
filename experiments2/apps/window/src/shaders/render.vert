#version 300 es

precision highp float;
in vec3 aVertexPosition;
in vec2 aTextureCoord;
in vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uShadowMatrix;

uniform sampler2D uPosMap;
uniform vec2 uViewport;
uniform float uParticleSize;
out vec3 vColor;
out vec4 vShadowCoord;

float particleSize(vec4 screenPos, mat4 mtxProj, vec2 viewport, float radius) {
	return viewport.y * mtxProj[1][1] * radius / screenPos.w;
}

#define radius 0.005

void main(void) {
    vec3 pos = texture(uPosMap, aTextureCoord).xyz;
    pos.z -= 0.5;
    vec4 wsPos = uModelMatrix * vec4(pos, 1.0);
    gl_Position = uProjectionMatrix * uViewMatrix * wsPos;

    float s = mix(2.0, 4.0, aVertexPosition.z);
    gl_PointSize = particleSize(gl_Position, uProjectionMatrix, uViewport, radius * s) ;
    if(uParticleSize > 0.0) {
        gl_PointSize = uParticleSize;
    }

    float g = mix(0.8, 1.0, aVertexPosition.x);
    vColor = vec3(g, g, g);

    vShadowCoord = uShadowMatrix * wsPos;
}