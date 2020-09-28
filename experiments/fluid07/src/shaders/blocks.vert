// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;
attribute vec2 aUVOffset;
attribute vec3 aExtra;
// attribute vec3 aColor;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uShadowMatrix;


uniform sampler2D texturePos;
uniform sampler2D textureVel;
uniform sampler2D textureData;
uniform sampler2D texturePosOrg;
uniform sampler2D textureCurrColor;
uniform sampler2D textureNextColor;

uniform float uTime;
uniform float uUseColorMap;
uniform float uSize;
uniform float uOffsetColor;
uniform vec3 uColors[5];

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vColor;
varying vec3 vExtra;
varying vec4 vShadowCoord;

#pragma glslify: rotate    = require(glsl-utils/rotate.glsl)
#pragma glslify: align    = require(glsl-utils/align.glsl) 
#pragma glslify: snoise    = require(glsl-utils/snoise.glsl)

#define PI 3.141592653

void main(void) {
    vec3 posOffset = texture2D(texturePos, aUVOffset).xyz;
    vec3 posOrg = texture2D(texturePosOrg, aUVOffset).xyz;
    vec3 velOrg = texture2D(textureVel, aUVOffset).xyz;
    vec3 vel = normalize(velOrg);

    float scale = mix(0.8, 1.0, aExtra.x);
    vec3 pos = aVertexPosition * scale;
    pos.yz = rotate(pos.yz, aExtra.z * PI * 2.0);

    pos = align(pos, vel);
    pos += posOffset;

    vec4 wsPos = uModelMatrix * vec4(pos, 1.0);

    gl_Position = uProjectionMatrix * uViewMatrix * wsPos;
    vTextureCoord = aTextureCoord;
    vec3 N = aNormal;
    N.yz = rotate(N.yz, aExtra.z * PI * 2.0);
    vNormal = align(N, vel);



    vec2 uvOrg = posOffset.xy / uSize * .5 + .5;
    uvOrg += aExtra.zy * 0.1;
    uvOrg.x = fract(uvOrg.x);
    uvOrg.y = fract(uvOrg.y);
    vec3 colorCurr = texture2D(textureCurrColor, uvOrg).rgb;
    vec3 colorNext = texture2D(textureNextColor, uvOrg).rgb;
    vec3 color = mix(colorCurr, colorNext, uOffsetColor);



    vColor = color;
    vExtra = aExtra;
    // vColor = vec3(speed);

    vShadowCoord = uShadowMatrix * wsPos;
}