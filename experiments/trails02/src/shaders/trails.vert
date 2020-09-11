// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;
attribute vec3 aExtra;
attribute vec3 aColor;
attribute vec2 aUVOffset;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uShadowMatrix;

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
uniform sampler2D texture10;
uniform sampler2D texture11;
uniform sampler2D texture12;
uniform sampler2D texture13;
uniform sampler2D texture14;
uniform sampler2D textureData;
uniform sampler2D textureColor;

uniform vec3 uColors[5];

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vNormalOrg;
varying vec3 vDebug;
varying vec3 vColor;
varying vec4 vShadowCoord;

#pragma glslify: rotate = require(glsl-utils/rotate.glsl)
#define PI 3.141592653

vec3 getPos(float index, vec2 uv) {
    vec3 pos = vec3(0.0);

    if(index < 0.5) {
        pos = texture2D(texture0, uv).xyz;
    } else if(index < 1.5) {
        pos = texture2D(texture1, uv).xyz;
    } else if(index < 2.5) {
        pos = texture2D(texture2, uv).xyz;
    } else if(index < 3.5) {
        pos = texture2D(texture3, uv).xyz;
    } else if(index < 4.5) {
        pos = texture2D(texture4, uv).xyz;
    } else if(index < 5.5) {
        pos = texture2D(texture5, uv).xyz;
    } else if(index < 6.5) {
        pos = texture2D(texture6, uv).xyz;
    } else if(index < 7.5) {
        pos = texture2D(texture7, uv).xyz;
    } else if(index < 8.5) {
        pos = texture2D(texture8, uv).xyz;
    } else if(index < 9.5) {
        pos = texture2D(texture9, uv).xyz;
    } else if(index < 10.5) {
        pos = texture2D(texture10, uv).xyz;
    } else if(index < 11.5) {
        pos = texture2D(texture11, uv).xyz;
    } else if(index < 12.5) {
        pos = texture2D(texture12, uv).xyz;
    } else if(index < 13.5) {
        pos = texture2D(texture13, uv).xyz;
    } else  {
        pos = texture2D(texture14, uv).xyz;
    }

    return pos;
}

vec3 getDir(float index, vec2 uv) {
    vec3 dir = vec3(1.0, 0.0, 0.0);
    vec3 pos0, pos1;

    if(index < 13.5) {
        dir = getPos(index + 1.0, uv) - getPos(index, uv);
    } else {
        dir = getPos(index - 1.0, uv) - getPos(index - 2.0, uv);
    }

    return normalize(dir);
}

vec3 align(vec3 pos, vec3 dir) {
    vec3 initDir = vec3(1.0, 0.0, 0.0);
    vec3 axis = cross(dir, initDir);
    float angle = acos(dot(dir, initDir));
    return rotate(pos, axis, angle);
}

float radius = 0.01;

void main(void) {
    // life
    float life = texture2D(textureData, aUVOffset).x;
    float t = life;
    float scale = clamp(t, 0.0, 1.0);
    scale = sin(scale * PI) * mix(1.0, 2.0, aExtra.y);
    
    // scale = abs(scale - 0.5) / 0.5;

    vec3 v = vec3(0.0, radius * scale, 0.0);
    float theta = -aTextureCoord.y * PI * 2.0;
    v.yz = rotate(v.yz, theta);

    vec3 dir = getDir(aVertexPosition.x, aUVOffset);
    v = align(v, dir);
    vDebug = vec3(t, life, scale);

    
    vec3 posOffset = getPos(aVertexPosition.x, aUVOffset);
    v += posOffset;

    vec3 N = vec3(0.0, 1.0, 0.0);
    N.yz = rotate(N.yz, theta);
    N = align(N, dir);
    

    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(v, 1.0);
    vTextureCoord = aTextureCoord;
    vNormalOrg = aNormal;
    vNormal = N;
/*
    vec3 color = vec3(1.0);

    if(aExtra.x < 0.1) {
        color = uColors[0];
    } else if(aExtra.x < 0.3) {
        color = uColors[1];
    } else if(aExtra.x < 0.5) {
        color = uColors[2];
    } else if(aExtra.x < 0.7) {
        color = uColors[3];
    } else {
        color = uColors[4];
    }
*/
    // vec3 color = texx§ture2D(textureData, aExtra.xy).rgb;
    vColor = aColor;

    vShadowCoord = uShadowMatrix * uModelMatrix * vec4(v, 1.0);
}