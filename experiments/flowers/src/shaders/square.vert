// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;
attribute vec4 aPosOffset;


uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec2 vUV;

void main(void) {
    vec3 pos            = aVertexPosition;
         pos.xy        += aPosOffset.xy;
         gl_Position    = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
         vTextureCoord  = aTextureCoord;
         vNormal        = aNormal;
         vUV            = aPosOffset.zw;
}