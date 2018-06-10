// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;
attribute vec2 aUV;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uShadowMatrix;

uniform sampler2D texturePos;
uniform sampler2D textureExtra;
uniform float uTime;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vColor;
varying vec4 vShadowCoord;

mat4 rotationMatrix(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    
    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}

vec3 rotate(vec3 v, vec3 axis, float angle) {
	mat4 m = rotationMatrix(axis, angle);
	return (m * vec4(v, 1.0)).xyz;
}

void main(void) {
	vec3 pos        = texture2D(texturePos, aUV).xyz;
	vec3 extra      = texture2D(textureExtra, aUV).xyz;
	
	vec3 axis       = normalize(extra * 2.0 - 1.0);
	float angle     = (extra.r + extra.g * extra.b + uTime * mix(extra.b, 1.0, .5)) * 2.0;
	
	vec3 position   = rotate(aVertexPosition, axis, angle);
	position        *= mix(extra, vec3(1.0), .7);
	position        += pos;
	
	vec4 wsPosition = uModelMatrix * vec4(position, 1.0);
	gl_Position     = uProjectionMatrix * uViewMatrix * wsPosition;
	
	vTextureCoord   = aTextureCoord;
	vNormal         = rotate(aNormal, axis, angle);
	vShadowCoord    = uShadowMatrix * wsPosition;
	vColor 			= vec3(mix(extra.g, 1.0, .7));
}