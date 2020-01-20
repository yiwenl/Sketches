// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;
attribute vec2 aExtra;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform float uTime;
uniform vec3 uColors[5];

uniform sampler2D uMap;


varying vec2 vTextureCoord;
varying vec2 vUV;
varying vec3 vDebug;
varying vec3 vNormal;
varying vec3 vPosition;


#pragma glslify: snoise = require('glsl-utils/snoise.glsl')
#pragma glslify: map = require('glsl-utils/map.glsl')
#define PI 3.141592653

void main(void) {
    float thetaX = (atan(aNormal.x, aNormal.z) + PI) / PI / 2.0;
    // thetaX = mod(thetaX + 0.5, 1.0);
    thetaX = thetaX + 0.25;
    if(thetaX > 1.0) {
        thetaX -= 1.0;
    }
    float thetaY = (atan(aNormal.y, length(aNormal.xz)) + PI/2.0) / PI;
    vUV = vec2(thetaX, thetaY);

    vDebug = texture2D(uMap, vUV).xyz;
    
    vec3 relativePos = aVertexPosition - aNormal;
    // float noise = vDebug.x;

    float noise = vDebug.x;
    noise = smoothstep(0.8, 0.1, noise);
    noise = mix(0.0, noise, aExtra.x);
    noise = sin(noise * PI * 0.5);
    relativePos *= (1.0 - noise * 0.85);

    vec3 pos = aNormal + relativePos * 0.975;
    pos *= ( 1.0 + noise * 0.05);
    

    vec4 position = uModelMatrix * vec4(pos, 1.0);
	vPosition     = position.xyz / position.w;
    gl_Position = uProjectionMatrix * uViewMatrix * position;
    
    vTextureCoord = aTextureCoord;
    vNormal = normalize(aNormal);

    
}