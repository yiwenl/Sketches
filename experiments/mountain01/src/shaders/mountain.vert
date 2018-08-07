// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform vec2 uPosOffset;
uniform vec3 uUVOffset;

uniform sampler2D textureHeight;
uniform float uHeight;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vPosition;

void main(void) {
	vec2 uv = aTextureCoord * uUVOffset.z + uUVOffset.xy;
	float height = texture2D(textureHeight, uv).r;
	vec3 position = aVertexPosition;
	position.xz += uPosOffset;
	position.y = height * uHeight;


    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(position, 1.0);
    vTextureCoord = uv;
    vNormal = aNormal;
    vPosition = position;
}