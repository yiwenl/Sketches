#version 300 es

precision highp float;
in vec3 aVertexPosition;
in vec2 aTextureCoord;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uShadowMatrix;
uniform vec2 uViewport;

out vec3 vColor;
out float vDepth;
out float vViewZ;
out vec3 vWorldPos;
out vec4 vShadowCoord;

float particleSize(vec4 screenPos, mat4 mtxProj, vec2 viewport, float radius) {
	return viewport.y * mtxProj[1][1] * radius / screenPos.w;
}

#define radius 0.01

void main(void) {
    vec4 worldPos = uModelMatrix * vec4(aVertexPosition, 1.0);
    vec4 viewPos = uViewMatrix * worldPos;
    gl_Position = uProjectionMatrix * viewPos;

    // depth from camera (negative Z in view space)
    vDepth = -viewPos.z;
    // view space Z coordinate (negative for points in front of camera)
    vViewZ = viewPos.z;
    vWorldPos = worldPos.xyz;
    
    // shadow coordinate
    vShadowCoord = uShadowMatrix * worldPos;
    // color
    float g = mix(0.2, 0.4, aTextureCoord.y);
    vColor = vec3(g, g, g);

    // point size
    float pointSize = mix(2.0, 4.0, aTextureCoord.x);
    gl_PointSize = particleSize(gl_Position, uProjectionMatrix, uViewport, radius * pointSize);
}