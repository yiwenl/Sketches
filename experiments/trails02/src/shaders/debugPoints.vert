// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec2 uViewport;

uniform sampler2D texturePos;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vColor;

const float radius = 0.005;

void main(void) {
    vec3 pos = texture2D(texturePos, aTextureCoord).xyz;
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
    vNormal = aNormal;

    vColor = vec3(1.0);

    float distOffset = uViewport.y * uProjectionMatrix[1][1] * radius / gl_Position.w;

    gl_PointSize = distOffset + aVertexPosition.x;
}