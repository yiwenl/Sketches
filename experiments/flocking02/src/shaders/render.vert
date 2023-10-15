#version 300 es

precision highp float;
in vec3 aVertexPosition;
in vec2 aTextureCoord;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform sampler2D uPosMap;
uniform sampler2D uDataMap;
uniform vec2 uViewport;

out vec3 vColor;

#pragma glslify: particleSize    = require(./glsl-utils/particleSize.glsl)

#define radius 0.01
#define PI 3.1415926535


void main(void) {

    vec3 pos = texture(uPosMap, aTextureCoord).xyz;
    vec3 data = texture(uDataMap, aTextureCoord).xyz;

    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);

    gl_PointSize = particleSize(gl_Position, uProjectionMatrix, uViewport, radius) * mix(1.0, 2.0, aVertexPosition.x);

    // vColor = mix(color0, color1, data.y);
    
    float cycle = data.x;

    float g = abs(cycle - PI);
    g = smoothstep(0.7, 0.2, g);
    g = max(sin(g * PI * 0.5), 0.0);

    g *= mix(.8, 1.0, aVertexPosition.y);

    g = mix(g, 1.0, .15);


    vColor = vec3(g);
}