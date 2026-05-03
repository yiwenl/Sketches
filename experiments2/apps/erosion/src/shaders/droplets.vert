#version 300 es

precision highp float;
in vec3 aVertexPosition;
in vec2 aTextureCoord;
in vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform sampler2D uPosMap;
uniform sampler2D uHeightMap;
uniform sampler2D uDebugMap;

uniform float uMapSize;
uniform vec2 uViewport;

out vec3 vColor;


float particleSize(vec4 screenPos, mat4 mtxProj, vec2 viewport, float radius) {
	return viewport.y * mtxProj[1][1] * radius / screenPos.w;
}

#define radius 0.005

void main(void) {
    vec3 pos = texture(uPosMap, aVertexPosition.xy).xyz;
    float water = pos.z;
    vec2 uv = pos.xy / uMapSize * 0.5 + 0.5;
    float height = texture(uHeightMap, uv).r;

    vec3 posFinal = vec3(pos.x, height, pos.y);

    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(posFinal, 1.0);

    vec3 debug = texture(uDebugMap, aVertexPosition.xy).xyz;
    // debug.xy = normalize(debug.xy) * .5 + .5;

    vColor = vec3(debug);
    // float t = smoothstep(0.0, 0.001, debug.z);
    float t = debug.z <= 0.0 ? 1.0 : 0.0;
    vColor = vec3(t);
    vColor = debug.z > 0.0 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);

    t = smoothstep(0.0, 0.1, water) * 0.9;
    vColor = vec3(t);
    // vColor = vec3(mix(height,aVertexPosition.z, 0.25));

    // particle size
    float s = 2.0;
    gl_PointSize = particleSize(gl_Position, uProjectionMatrix, uViewport, radius * s) ;

    
}