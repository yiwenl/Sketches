// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform sampler2D textureCurr;
uniform sampler2D textureNext;

varying vec2 vTextureCoord;
varying vec3 vNormal;

void main(void) {

	vec2 uv      = aVertexPosition.xy;
	vec3 posCurr = texture2D(textureCurr, uv).rgb;
	vec3 posNext = texture2D(textureNext, uv).rgb;

	vec3 position = mix(posCurr, posNext, aVertexPosition.z);

    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(position, 1.0);
    vNormal = aNormal;
}