// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;
attribute vec2 aUV;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;


uniform sampler2D texture0;
uniform sampler2D texture1;
uniform sampler2D texture2;
uniform sampler2D texture3;
uniform sampler2D texture4;
uniform sampler2D texture5;
uniform sampler2D texture6;
uniform sampler2D texture7;
uniform sampler2D texture8;
uniform sampler2D texture9;

varying vec2 vTextureCoord;
varying vec3 vNormal;


vec3 getPosOffset() {

	vec3 v;
	vec3 vNext;

	if(aTextureCoord.x < 0.1) {
		v = texture2D(texture0, aUV).xyz;
	} else if(aTextureCoord.x < 0.2) {
		v = texture2D(texture1, aUV).xyz;
	} else if(aTextureCoord.x < 0.3) {
		v = texture2D(texture2, aUV).xyz;
	} else if(aTextureCoord.x < 0.4) {
		v = texture2D(texture3, aUV).xyz;
	} else if(aTextureCoord.x < 0.5) {
		v = texture2D(texture4, aUV).xyz;
	} else if(aTextureCoord.x < 0.6) {
		v = texture2D(texture5, aUV).xyz;
	} else if(aTextureCoord.x < 0.7) {
		v = texture2D(texture6, aUV).xyz;
	} else if(aTextureCoord.x < 0.8) {
		v = texture2D(texture7, aUV).xyz;
	} else if(aTextureCoord.x < 0.9) {
		v = texture2D(texture8, aUV).xyz;
	} else {
		v = texture2D(texture9, aUV).xyz;
	}

	return v;
}

void main(void) {
	vec3 position = aVertexPosition;
	vec3 posOffset = getPosOffset();
	position += posOffset;

    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(position, 1.0);
    vTextureCoord = aTextureCoord;
    vNormal = aNormal;
}