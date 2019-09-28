// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;
attribute vec2 aUVOffset;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uModelViewMatrixInverse;

uniform sampler2D texturePos;
uniform sampler2D textureMap;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vDebug;

#pragma glslify: getRadius    = require(./getRadius.glsl)

void main(void) {
	vec3 pos       = aVertexPosition;
	vec3 posOffset = texture2D(texturePos, aUVOffset).xyz;
	pos.xy         *= getRadius(posOffset.z);
	pos.xy         += posOffset.xy;
	gl_Position    = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
	
	vec4 screenPos = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(posOffset.xy, 0.0, 1.0);
	vec2 uvScreen  = screenPos.xy / screenPos.w * .5 + .5;
	vec3 colorMap  = texture2D(textureMap, uvScreen).xyz;
	vTextureCoord  = aTextureCoord;
	vNormal        = aNormal;
	vDebug         = colorMap * 1.5 * posOffset.z;
	vDebug         = vec3(posOffset.z);
}