// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;
attribute vec4 aPosOffset;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform float uOffset;
uniform float uZOffset;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec2 vUVOffset;

vec2 rotate(vec2 v, float a) {
    float c = cos(a);
    float s = sin(a);

    mat2 m = mat2(c, s, -s, c);
    return m * v;
}

#define PI 3.141592653

void main(void) {
    bool isFront = aVertexPosition.z > 0.0;
    float a;

    if(isFront) {
        a = smoothstep(0.0, 0.5, uOffset);
    } else {
        a = smoothstep(0.5, 1.0, uOffset);
    }
    a *= PI;

    vec3 pos     = aVertexPosition;
         pos.yz  = rotate(pos.yz, a);
         pos.xy += aPosOffset.xy;
         pos.z  += uZOffset;

    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);

    vTextureCoord = aTextureCoord;
    vNormal       = aNormal;
    vUVOffset     = aPosOffset.zw;
}