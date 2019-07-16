// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform float uRatio;
uniform float uScale;

varying vec2 vTextureCoord;
varying vec3 vNormal;

void main(void) {
	vec3 pos      = aVertexPosition;
	if(uRatio > 1.0) {
		pos.x /= uRatio;
	} else {
		pos.y *= uRatio;
	}

	pos.xy        *= uScale * 4.0;
	gl_Position   = vec4(pos, 1.0);
	vTextureCoord = aTextureCoord;
	vNormal       = aNormal;
}