precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;
attribute vec3 aUVOffset;
attribute vec3 aExtra;
attribute vec3 aPosOrg;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform float uNumSeg;
uniform float uLength;
uniform float uSetIndex;

${TEXTURES}

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vDebug;
varying vec3 vExtra;
varying float vAlpha;
varying float vDirection;
varying vec3 vWsPosition;
varying vec4 vScreenPosition;

vec3 getPosition(float index) {
	vec3 pos;

	${FUN_POS}

	return pos;
}



float getDirection(float index) {
	float ia = 0.0;
	float ib = 0.0;

	if(index <= 0.5) {	//	first point
		ia = 0.0;
		ib = 1.0;
	} else {
 		ia = index - 1.0;
 		ib = index;
	}

	vec3 a = getPosition(ia);
	vec3 b = getPosition(ib);
	vec3 dir = b - a;
	float theta = atan(-dir.y, dir.x);

	return theta;
}


#define PI 3.141592653

vec2 rotate(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, -s, s, c);
	return m * v;
}

void main(void) {
	vec3 posFirst    = getPosition(0.0);
	vec3 posLast     = getPosition(16.0);
	float speed      = distance(posFirst, posLast);
	speed            = smoothstep(1.5, 0.5, speed);
	float speedScale = (1.0 - speed * 0.5);
	
	float alpha      = 1.0;
	float scaleDiff  = mix(aExtra.r, 1.0, .25);
	
	float halfLength = uLength * 0.5;
	float index = uSetIndex * (aVertexPosition.z - 1.0) + aVertexPosition.x;
	float scaleY     = abs(index - halfLength) / halfLength;
	scaleY           = 1.0 - clamp(0.0, 1.0, scaleY);
	scaleY 			 = sin(scaleY * PI * 0.5);
	vec3 pos         = aVertexPosition * vec3(0.0, 0.02 * scaleDiff * scaleY, 0.0);
	
	float threshold = 0.99;
	float diff = length(posFirst.xy) - length(posLast.xy);
	if( diff < -threshold) {
		alpha = smoothstep(threshold, 0.0, -diff);
	}


	vec3 posOffset = getPosition(aVertexPosition.x);
//*/
	threshold = 1.0;
	if(aVertexPosition.x < uNumSeg - 1.0) {
		vec3 posNext = getPosition(aVertexPosition.x + 1.0);
		float d = distance(posOffset.xy, posNext.xy);
		if(d > threshold) {
			alpha = 0.0;
		}
	}

	if(aVertexPosition.x > 1.0) {
		vec3 posPrev = getPosition(aVertexPosition.x - 1.0);
		float d = distance(posOffset.xy, posPrev.xy);
		if(d > threshold) {
			alpha = 0.0;
		}
	}
//*/	
	

	float theta = getDirection(aVertexPosition.y);
	pos.xy 		   = rotate(pos.xy, theta);
	vWsPosition    = pos + posOffset;
	gl_Position    = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(vWsPosition, 1.0);

	vec4 posOrgMVP     = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosOrg, 1.0);
	vScreenPosition    = posOrgMVP;

	// vec4 posFinal  = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4((posFirst+posLast) * 0.5, 1.0);
	vTextureCoord  = aTextureCoord;
	vNormal        = aNormal;
	vAlpha         = alpha;
	vExtra         = aExtra;
	vDirection 	   = theta;
	
	// vec2 uvScreen  = posFinal.xy / posFinal.w * .5 + .5;	
	vDebug         = vec3(1.0);

}