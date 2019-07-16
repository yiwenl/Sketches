// render.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uShadowMatrix;
uniform sampler2D textureCurr;
uniform sampler2D textureExtra;
uniform sampler2D textureOrg;
uniform sampler2D textureBg1;
uniform sampler2D textureBg2;
uniform float uParticleScale;
uniform vec2 uViewport;

varying vec4 vColor;
varying vec3 vNormal;
varying vec3 vExtra;
varying vec3 vWsPosition;
varying vec4 vScreenPosition;

varying vec4 vShadowCoord;

const float radius = 0.03;

void main(void) {
	vec2 uv            = aVertexPosition.xy;
	vec3 pos           = texture2D(textureCurr, uv).rgb;
	
	vec3 extra         = texture2D(textureExtra, uv).rgb;
	vec4 wsPosition    = uModelMatrix * vec4(pos, 1.0);
	vWsPosition        = wsPosition.xyz;
	gl_Position        = uProjectionMatrix * uViewMatrix * wsPosition;
	
	vec3 posOrg        = texture2D(textureOrg, uv).rgb;
	vec4 posOrgMVP     = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(posOrg, 1.0);
	vScreenPosition    = posOrgMVP;
	float distToCenter = length(vWsPosition.xy);
	vColor             = vec4(1.0);
	
	float distOffset   = uViewport.y * uProjectionMatrix[1][1] * radius / gl_Position.w;
	
	float scale        = smoothstep(0.95, 0.25, extra.x);
	float scaleOffset  = smoothstep(6.0, 4.0, distToCenter);
	scaleOffset        = mix(scaleOffset, 1.0, .25);
	gl_PointSize       = distOffset * (1.0 + extra.g * 2.0) * scale * uParticleScale * scaleOffset;
	
	vNormal            = aNormal;
	vShadowCoord       = uShadowMatrix * wsPosition;
	vExtra             = extra;
}