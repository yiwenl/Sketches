// shadow.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;
uniform mat3 uModelViewMatrixInverse;

uniform sampler2D textureCurr;
uniform sampler2D textureNext;
uniform sampler2D textureExtra;
uniform vec2 uViewport;
uniform float percent;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec4 vColor;

const float radius = 0.075;

void main(void) {
    vec2 uv      = aVertexPosition.xy;
	vec3 posCurr = texture2D(textureCurr, uv).rgb;
	vec3 posNext = texture2D(textureNext, uv).rgb;
	vec3 pos     = mix(posCurr, posNext, percent);
	vec3 extra   = texture2D(textureExtra, uv).rgb;

	vec4 V = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
	gl_Position = V;
	

    vNormal = aNormal;
    float d 	 = V.z/V.w;
	d 			 = d*.5 + .5;
	vColor       = vec4(d, d, d, 1.0);

	// gl_PointSize = uViewport.y * uProjectionMatrix[1][1] * radius / gl_Position.w;
	gl_PointSize = 2.0;
}
