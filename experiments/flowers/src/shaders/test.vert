// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;
attribute vec3 aNext;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform float uOffset;

varying vec2 vTextureCoord;
varying vec3 vNormal;


vec3 getPos(vec3 pos) {
	pos.z         -= sqrt(uOffset * aTextureCoord.x);
	pos.xy        *= 1.0 - uOffset;
	return pos;
}

void main(void) {

	vec3 pos      = getPos(aVertexPosition);
	gl_Position   = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);

	vTextureCoord = aTextureCoord;

	vec3 center = vec3(0.0, 0.0, -sqrt(uOffset));
	
	vec3 curr   = aNormal * (1.0 - uOffset);
	vec3 next   = aNext * (1.0 - uOffset);
	
	vec3 va     = curr - center;
	vec3 vb     = next - center;
	vec3 n      = normalize(cross(va, vb));
	vNormal     = n;
}