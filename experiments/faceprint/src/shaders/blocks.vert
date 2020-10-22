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
uniform mat4 uFrontMatrix;

uniform sampler2D textureMask;
uniform float uScale;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vColor;
varying vec3 vExtra;


void main(void) {
    vec4 screenPos = uFrontMatrix * uModelMatrix * vec4(aPosOffset, 1.0);
    vec2 uv = (screenPos.xy / screenPos.w ) * .5 + .5;
    vec3 color = texture2D(textureMask, uv).rgb;


    float scaleOpen = uScale * 2.0 - aExtra.z;
    scaleOpen = clamp(scaleOpen, 0.0, 1.0);

    float scale = mix(0.5, 1.5, aExtra.r) * color.r * scaleOpen;
    vec3 pos = aVertexPosition * scale + aPosOffset;
    pos.xy += (aExtra.xy - 0.5) * 0.1;

    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);


    vTextureCoord = aTextureCoord;
    vNormal = aNormal;
    vColor = color;
    vExtra = aExtra;
}