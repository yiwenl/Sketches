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
uniform sampler2D textureData;
uniform sampler2D textureMap;
uniform float percent;
uniform float time;
uniform vec2 uViewport;

varying vec4 vColor;
varying vec3 vNormal;
varying vec4 vShadowCoord;

const float radius = 0.04 * 2.0;

void main(void) {
	vec2 uv      = aVertexPosition.xy;
	vec3 posCurr = texture2D(textureCurr, uv).rgb;
	vec3 posNext = texture2D(textureNext, uv).rgb;
	vec3 pos     = mix(posCurr, posNext, percent);
	vec3 extra   = texture2D(textureExtra, uv).rgb;
	vec3 data    = texture2D(textureData, uv).xyz;
	vec2 uvMap   = data.xy;
	float life   = data.z;
	vec4 wsPosition  = uModelMatrix * vec4(pos, 1.0);
	gl_Position  = uProjectionMatrix * uViewMatrix * wsPosition;
	

	float lifeScale = smoothstep(0., 0.0, abs(life - 0.5) );
	float g 	 = sin(extra.r + time * mix(extra.b, 1.0, .5));
	g 			 = smoothstep(0.0, 1.0, g);
	g 			 = mix(g, 1.0, .75);
	vec4 color = texture2D(textureMap, uvMap);
	color.rgb *= g;
	vColor = color;
	// vColor = vec4(vec3(lifeScale), 1.0);


	float distOffset = uViewport.y * uProjectionMatrix[1][1] * radius / gl_Position.w;
	gl_PointSize = distOffset * mix(0.5, 2.5, extra.x) ;

	vNormal 	 = aNormal;
	vShadowCoord = uShadowMatrix * wsPosition;
	
}