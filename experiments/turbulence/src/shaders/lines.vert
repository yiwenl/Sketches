// lines.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

{{uniformTextures}}

vec3 getPosition(vec3 mValue) {
	if(mValue.z < 1.0) {
		return texture2D(texture0, mValue.xy).rgb;
	} else if(mValue.z < 2.0) {
		return texture2D(texture1, mValue.xy).rgb;
	} else if(mValue.z < 3.0) {
		return texture2D(texture2, mValue.xy).rgb;
	} else if(mValue.z < 4.0) {
		return texture2D(texture3, mValue.xy).rgb;
	} else if(mValue.z < 5.0) {
		return texture2D(texture4, mValue.xy).rgb;
	} else if(mValue.z < 6.0) {
		return texture2D(texture5, mValue.xy).rgb;
	} else if(mValue.z < 7.0) {
		return texture2D(texture6, mValue.xy).rgb;
	} else if(mValue.z < 8.0) {
		return texture2D(texture7, mValue.xy).rgb;
	} else if(mValue.z < 9.0) {
		return texture2D(texture8, mValue.xy).rgb;
	} else {
		return texture2D(texture9, mValue.xy).rgb;
	} 
}

uniform sampler2D textureGradient;
varying vec3 vNormal;
varying vec4 vColor;

void main(void) {
	vec3 position = getPosition(aVertexPosition);
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(position, 1.0);
    vNormal = aNormal;

    // float g = mix(aVertexPosition.z/10.0, 1.0, .5);
    float g = aVertexPosition.z/10.0;
    vColor = vec4(vec3(g), 1.0);
}