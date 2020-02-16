// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;
attribute vec3 aPosOffset;
attribute vec3 aExtra;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uShadowMatrix;
uniform sampler2D textureDepth;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vExtra;
varying float vIndex;
varying vec3 vDebug;

void main(void) {
    float scale = mix(0.2, 2.0, aExtra.x);
    vec3 posCenter = vec3(0.0, aVertexPosition.z, 0.0);
    posCenter.xy *= scale;
    posCenter += aPosOffset;
    vec4 screenPos = uShadowMatrix * uModelMatrix * vec4(posCenter, 1.0);
    vec2 uvScreen = (screenPos.xy / screenPos.w);
    float depth = texture2D(textureDepth, uvScreen).z;

    vec3 pos = vec3(aVertexPosition.xy, 0.0);
    pos.y += aVertexPosition.z;
    pos.xy *= scale;
    pos += aPosOffset;
    pos.z += depth;
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);

    

    vTextureCoord = aTextureCoord;
    vNormal = aNormal;
    vIndex = aNormal.y + floor(aExtra.x * 64.0);
    vExtra = aExtra;

    vDebug = vec3(uvScreen, depth);
}