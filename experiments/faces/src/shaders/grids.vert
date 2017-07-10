// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec2 aUV;
attribute vec3 aNormal;
attribute vec3 aPosOffset;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform sampler2D texture;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying float vDepth;

void main(void) {
	vec3 position 	= aVertexPosition + aPosOffset;

	vec3 color = texture2D(texture, aUV).rgb;
	float g = dot(color, vec3(0.299, 0.587, 0.114));

	position.z += g * 4.0;

    gl_Position 	= uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(position, 1.0);
    vTextureCoord 	= aTextureCoord;
    vNormal 		= aNormal;
    vDepth 			= g;
}