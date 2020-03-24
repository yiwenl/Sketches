// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform vec2 uViewport;
uniform float uTime;
uniform float uRange;

varying vec2 vTextureCoord;
varying vec3 vNormal;

const float radius = 0.01;

void main(void) {

    vec3 pos = aVertexPosition;

    float speed = mix(0.1, 1.2, aTextureCoord.y);
    pos += aNormal * uTime * speed;

    float r = uRange;
    pos.x = mod(pos.x + r, r * 2.0) - r;
    pos.y = mod(pos.y + r, r * 2.0) - r;
    pos.z = mod(pos.z + r, r * 2.0) - r;

    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
    vTextureCoord = aTextureCoord;
    vNormal = aNormal;

    float distOffset = uViewport.y * uProjectionMatrix[1][1] * radius / gl_Position.w;
	gl_PointSize = distOffset * (1.0 + aTextureCoord.x * 1.0);
}