// ribbon.vert

#define SHADER_NAME BASIC_VERTEX

precision highp float;
attribute vec3 aVertexPosition;
attribute vec3 aPositionUV;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

uniform sampler2D texture0;
uniform sampler2D texture1;
uniform sampler2D texture2;
uniform sampler2D texture3;
uniform sampler2D texture4;
uniform sampler2D texture5;
uniform sampler2D texture6;
uniform sampler2D texture7;
uniform sampler2D texture8;
uniform sampler2D texture9;
uniform float range;

const float PI = 3.141592657;
varying vec2 vTextureCoord;
varying float vOpacity;
varying float vDepth;
varying vec3 vVertex;
varying vec3 vNormal;

vec2 rotate(vec2 v, float a) {
	float c = cos(a);
	float s = sin(a);
	mat2 r = mat2(s, c, -c, s);
	return r * v;
}

//float n = 5.0;
//float f = 3000.0;
	
float getDepth(float z, float n, float f) {
	return (2.0 * n) / (f + n - z*(f-n));
}

float getDepth(float z) {
	return getDepth(z, 5.0, 3000.0);
}

void main(void) {
	vec2 uv = aPositionUV.xy/2.0;
	float i = aPositionUV.z/10.0;

	vec3 pos = vec3(.0);
	vec3 start = texture2D(texture0, uv).rgb;
	vec3 end = texture2D(texture9, uv).rgb;
	if(i < .1) {
		pos = start;
	} else if(i<.2) {
		pos = texture2D(texture1, uv).rgb;
	} else if(i<.3) {
		pos = texture2D(texture2, uv).rgb;
	} else if(i<.4) {
		pos = texture2D(texture3, uv).rgb;
	} else if(i<.5) {
		pos = texture2D(texture4, uv).rgb;
	} else if(i<.6) {
		pos = texture2D(texture5, uv).rgb;
	} else if(i<.7) {
		pos = texture2D(texture6, uv).rgb;
	} else if(i<.8) {
		pos = texture2D(texture7, uv).rgb;
	} else if(i<.9) {
		pos = texture2D(texture8, uv).rgb;
	} else {
		pos = end;
	}

	float angle = atan(pos.y, pos.z)-PI*.5;
	vec3 tmpPos = aVertexPosition;
	tmpPos.yz = rotate(tmpPos.yz, angle);
	// tmpPos.x *= 0.0;
	pos += tmpPos;

	vec4 V = uPMatrix * uMVMatrix * vec4(pos, 1.0);
    gl_Position = V;
    vTextureCoord = aTextureCoord;

    vVertex = pos;
    vOpacity = 1.0;
    if(start.x > end.x) {
    	vOpacity = 0.0;
    }

    vec3 N = vec3(0.0, pos.yz);
    vNormal = normalize(N);

    vDepth = 1.0-getDepth(V.z/V.w);
}