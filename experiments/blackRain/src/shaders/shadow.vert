// render.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform sampler2D textureCurr;
uniform sampler2D textureNext;
uniform sampler2D textureExtra;
uniform sampler2D textureLife;
uniform float percent;
uniform float time;
uniform vec2 uViewport;

varying vec4 vColor;
varying vec3 vNormal;

const float radius = 0.01;

const vec3 color1 = vec3(85.0, 133.0, 54.0) / 255.0;
const vec3 color0 = vec3(255.0, 252.0, 202.0) / 255.0;

float exponentialIn(float t) {
  return t == 0.0 ? t : pow(2.0, 10.0 * (t - 1.0));
}

float exponentialOut(float t) {
  return t == 1.0 ? t : 1.0 - pow(2.0, -10.0 * t);
}

void main(void) {
	vec2 uv      = aVertexPosition.xy;
	vec3 posCurr = texture2D(textureCurr, uv).rgb;
	vec3 posNext = texture2D(textureNext, uv).rgb;
	vec3 pos     = mix(posCurr, posNext, percent);
	vec3 extra   = texture2D(textureExtra, uv).rgb;
	vec3 life    = texture2D(textureLife, uv).rgb;
	pos.xz       += life.yz;
	gl_Position  = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
	
	// float a = 1.0;
	// if(life.x <= 0.1) {
	// 	a = 0.0;
	// }
	float a = life.x;
	if(posNext.y < posCurr.y - 2.0) {
		a = 0.0;
	}
	
	
	// float g 	 = mix(extra.r, 1.0, .7);
	vColor       = vec4(vec3(1.0), a);

	// float distOffset = uViewport.y * uProjectionMatrix[1][1] * radius / gl_Position.w;
    gl_PointSize = 3.0;

	vNormal 	 = aNormal;
}