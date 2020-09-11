// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;
attribute vec3 aPosOffset;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uTopMatrix;

uniform sampler2D textureHeight;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vDebug;

void main(void) {
    vec3 pos = aVertexPosition;
    pos += aPosOffset;

    vec4 wsPos = uModelMatrix * vec4(pos, 1.0);
    vec4 topPos = uTopMatrix * wsPos;
    vec2 uv = topPos.xy / topPos.w * .5 + .5;

    float h = texture2D(textureHeight, uv).r;
    vDebug = vec3(uv, h);
    pos.y = h;
    wsPos = uModelMatrix * vec4(pos, 1.0);

    gl_Position = uProjectionMatrix * uViewMatrix * wsPos;
    vTextureCoord = aTextureCoord;
    vNormal = aNormal;
}