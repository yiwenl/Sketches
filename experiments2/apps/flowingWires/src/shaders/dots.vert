#version 300 es

precision highp float;
in vec3 aVertexPosition;
in vec2 aTextureCoord;
in vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec2 uViewport;

uniform sampler2D uPosMap;

out vec3 vColor;

float particleSize(vec4 screenPos, mat4 mtxProj, vec2 viewport, float radius) {
	return viewport.y * mtxProj[1][1] * radius / screenPos.w;
}

#define radius 0.002

void main(void) {
    vec3 pos = texture(uPosMap, aTextureCoord).xyz;
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);

    float g = mix(0.5, 1.0, aVertexPosition.x);
    vColor = vec3(g);

    float s = mix(2.0, 4.0, aVertexPosition.z);
    gl_PointSize = particleSize(gl_Position, uProjectionMatrix, uViewport, radius * s);
}