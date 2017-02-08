// render.vert

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
uniform sampler2D textureTest;
uniform sampler2D textureNormal;
uniform sampler2D textureGradient;
uniform float percent;
uniform float time;
uniform float uMaxHeight;
uniform vec2 uViewport;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWsPosition;
varying vec3 vEyePosition;
varying vec3 vWsNormal;
varying vec4 vColor;

const float radius = 0.01;


void main(void) {
	vec2 uv      = aVertexPosition.xy;
	vec3 posCurr = texture2D(textureCurr, uv).rgb;
	vec3 posNext = texture2D(textureNext, uv).rgb;
	vec3 pos     = mix(posCurr, posNext, percent);
	vec3 extra   = texture2D(textureExtra, uv).rgb;

	vec4 worldSpacePosition	= uModelMatrix * vec4(pos, 1.0);
    vec4 viewSpacePosition	= uViewMatrix * worldSpacePosition;
	
    
    vPosition				= viewSpacePosition.xyz;
	vWsPosition				= worldSpacePosition.xyz;
	
	vec4 eyeDirViewSpace	= viewSpacePosition - vec4( 0, 0, 0, 1 );
	vEyePosition			= -vec3( uModelViewMatrixInverse * eyeDirViewSpace.xyz );
	
    gl_Position				= uProjectionMatrix * viewSpacePosition;

	
	float a      = 1.0;
	if(posNext.x < posCurr.x) {
		a = 0.0;
	}

	float p = (pos.y-1.0)*1.25 / uMaxHeight;
	p = clamp(p, 0.0, 1.0);
	p = mix(p, extra.b, .5);
	vec4 color = texture2D(textureGradient, vec2(p, extra.r));
	vec2 uvMap = texture2D(textureTest, uv).xy;
	vec3 N = texture2D(textureNormal, uvMap).rbg * 2.0 - 1.0;
	N.rb *= -1.0;
	vColor = color;
	vColor.rgb *= 0.25;
	vColor.a *= a;


	vNormal					= uNormalMatrix * aNormal;
	vNormal 				= N;
	vWsNormal				= normalize( uModelViewMatrixInverse * vNormal );


	// float g 	 = sin(extra.r + time * mix(extra.b, 1.0, .5));
	// g 			 = smoothstep(0.0, 1.0, g);
	// g 			 = mix(g, 1.0, .5);
	// vColor       = vec4(vec3(g), a);

	// vColor 			= texture2D(textureTest, uv);

	float distOffset = uViewport.y * uProjectionMatrix[1][1] * radius / gl_Position.w;
    gl_PointSize = distOffset * (1.0 + extra.x * 1.0);
}