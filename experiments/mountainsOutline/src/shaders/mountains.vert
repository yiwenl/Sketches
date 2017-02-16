// mountains.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;
attribute vec3 aPosOffset;
attribute vec3 aHeights;
attribute vec3 aExtra;
attribute vec3 aUV;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;
uniform mat3 uModelViewMatrixInverse;

uniform float uRange;
uniform float zOffset;

uniform sampler2D textureHeight;

varying vec2 vTextureCoord;
varying vec2 vUVNormal;
varying vec3 vUV;
varying vec3 vNormal;
varying vec4 vViewSpace;
varying float vRotation;
varying vec3 vEyePosition;
varying vec4 vWsPosition;
varying vec3 vPosition;


vec2 rotate(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, -s, s, c);
	return m * v;
}

void main(void) {
	vec2 uv                = aHeights.xy + aTextureCoord / 8.0;
	vUVNormal              = uv;
	float h                = texture2D(textureHeight, uv).r;
	vec3 position          = aVertexPosition;
	position.y             += pow(h, 3.0) * aHeights.z * aPosOffset.y;
	
	position.xz            = rotate(position.xz, aExtra.y);
	position.xz            *= aExtra.x;
	
	vec3 posOffset         = aPosOffset;
	posOffset.y            = 0.0;
	posOffset              += vec3(0.0, 0.0, -zOffset);
	posOffset.z            = mod(posOffset.z + uRange, uRange * 2.0) - uRange;
	position               += posOffset;
	
	vPosition              = position;
	vWsPosition            = uModelMatrix * vec4(position, 1.0);
	
	vec4 eyeDirViewSpace   = vWsPosition - vec4( 0, 0, 0, 1 );
	vEyePosition           = -vec3( uModelViewMatrixInverse * eyeDirViewSpace.xyz );
	
	vec4 viewspacePosition = uViewMatrix * vWsPosition;
	gl_Position            = uProjectionMatrix * viewspacePosition;
	vTextureCoord          = aTextureCoord;
	vNormal                = aNormal;
	vUV                    = aUV;
	vViewSpace             = viewspacePosition;
	vRotation              = aExtra.y;
}