precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec2 aPointCoord;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform sampler2D texture;
uniform sampler2D textureExtra;

varying vec4 vColor;
varying vec2 vPointCoord;

void main(void) {
	vec3 pos        = texture2D(texture, aTextureCoord).rgb;
	vec3 extra      = texture2D(textureExtra, aTextureCoord).rgb;
	
	vec4 mvPosition = uViewMatrix * uModelMatrix * vec4(pos, 1.0);
	mvPosition.xyz  += aVertexPosition;
	
	gl_Position     = uProjectionMatrix * mvPosition;
	
	vColor          = vec4(1.0, 0.0, 0.0, 1.0);
	vPointCoord 	= aPointCoord;
	// vColor          = vec4(vec3(extra.b), 1.0);
}