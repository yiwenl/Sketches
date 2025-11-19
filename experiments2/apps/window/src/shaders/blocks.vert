#version 300 es

precision highp float;
in vec3 aVertexPosition;
in vec2 aTextureCoord;
in vec3 aNormal;
in vec2 aUv;
in vec3 aExtra;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uShadowMatrix;
uniform sampler2D uPosMap;
uniform sampler2D uVelMap;

out vec2 vTextureCoord;
out vec3 vNormal;
out vec4 vShadowCoord;

vec3 _normalize(vec3 v) {
    if(length(v) < 0.0001) {
        return vec3(1.0, 0.0, 0.0);
    }
    return normalize(v);
}

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
    vec3 pos = aVertexPosition;
    pos.x *= aExtra.y;
    vec3 posOffset = texture(uPosMap, aUv).xyz;
    vec3 vel = _normalize(texture(uVelMap, aUv).xyz);


    vec3 forward = vec3(1.0, 0.0, 0.0);
    vec3 axis = cross(vel, forward);

    float angle = acos(dot(forward, vel));
    pos = rotate(pos, axis, angle);
    pos = pos * aExtra.x + posOffset;
    vNormal = rotate(aNormal, axis, angle);

    vec4 wsPos = uModelMatrix * vec4(pos, 1.0);
    vShadowCoord = uShadowMatrix * wsPos;
    
    gl_Position = uProjectionMatrix * uViewMatrix * wsPos;
    vTextureCoord = aTextureCoord;
}