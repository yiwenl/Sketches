// render.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uShadowMatrix;

uniform sampler2D textureCurr;
uniform sampler2D textureNext;
uniform sampler2D textureExtra;
uniform sampler2D textureLife;
uniform sampler2D textureFlame;
uniform float percent;
uniform float time;
uniform vec2 uViewport;

varying vec4 vColor;
varying vec3 vExtra;
varying vec3 vNormal;
varying vec4 vShadowCoord;
varying vec4 vWsPosition;

const float radius = 0.01;

const mat4 biasMatrix = mat4( 0.5, 0.0, 0.0, 0.0,
							  0.0, 0.5, 0.0, 0.0,
							  0.0, 0.0, 0.5, 0.0,
							  0.5, 0.5, 0.5, 1.0 );

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
	vWsPosition  = uModelMatrix * vec4(pos, 1.0);
	gl_Position  = uProjectionMatrix * uViewMatrix * vWsPosition;
	
	float a = smoothstep(0.0, 0.2, life.x);
	// float a = life.x;
	if(posNext.y < posCurr.y - 2.0) {
		a = 0.0;
	}
	
	float g          = mix(extra.r, 1.0, .8);
	// vec2 uvFlame     = vec2(0.5, pow(1.0 - life.x, 1.0));
	// vec3 colorFlame  = texture2D(textureFlame, uvFlame).rrr;
	vColor           = vec4(vec3(g), a);
	
	float distOffset = uViewport.y * uProjectionMatrix[1][1] * radius / gl_Position.w;
	gl_PointSize     = distOffset * (1.0 + extra.x * 1.0);
	
	vShadowCoord     = ( biasMatrix * uShadowMatrix ) * vec4(pos, 1.0);;
	vNormal          = aNormal;
	vExtra           = extra;
}