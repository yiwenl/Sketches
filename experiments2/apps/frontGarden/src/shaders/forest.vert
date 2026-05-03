#version 300 es

#define NUM_REGIONS $NUM_REGIONS

precision highp float;
in vec3 aVertexPosition;
in vec2 aTextureCoord;
in vec3 aColor;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uShadowMatrix;
uniform vec2 uViewport;
uniform vec4 uRegions[NUM_REGIONS];

out vec3 vColor;
out vec4 vShadowCoord;
out float vInRegion;


float particleSize(vec4 screenPos, mat4 mtxProj, vec2 viewport, float radius) {
	return viewport.y * mtxProj[1][1] * radius / screenPos.w;
}

#define radius 0.002


void main(void) {
    vec4 wsPos = uModelMatrix * vec4(aVertexPosition, 1.0);
    gl_Position = uProjectionMatrix * uViewMatrix * wsPos;

    vShadowCoord = uShadowMatrix * wsPos;

    float size = particleSize(gl_Position, uProjectionMatrix, uViewport, radius);
    gl_PointSize = size * mix(1.0, 3.0, aTextureCoord.x);

    // float g = mix(0.8, 1.0, aTextureCoord.y);
    vColor = aColor;


    vInRegion = 0.0;
    for(int i = 0; i < NUM_REGIONS; i++) {
        vec4 region = uRegions[i];
        if(distance(wsPos.xyz, region.xyz) < region.w) {
            vInRegion = 1.0;
            break;
        }
    }

}