// shadow.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
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

	gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
	
	gl_PointSize = uViewport.y * uProjectionMatrix[1][1] * radius / gl_Position.w;


    vTextureCoord = aTextureCoord;
    vNormal = aNormal;
    vColor = vec4(1.0);
}
