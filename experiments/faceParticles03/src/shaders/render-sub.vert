// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform sampler2D uPosMap;
uniform sampler2D uVelMap;
uniform float uTime;

uniform vec3 uColor0;
uniform vec3 uColor1;

varying vec3 vColor;

void main(void) {
    vec3 pos = texture2D(uPosMap, aTextureCoord).xyz;
    vec3 vel = texture2D(uVelMap, aTextureCoord).xyz;
    float speed = length(vel);  
    speed = smoothstep(0.0, 0.01, speed);
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);

    gl_PointSize = mix(1.0, 3.0, aVertexPosition.x) * speed * 2.5;

    float start = fract(aVertexPosition.x + aVertexPosition.y) * 10.0;
    float t = mix(1.0, 2.0, fract(aVertexPosition.z + aVertexPosition.y)) * 10.0;

    float g = sin(start + uTime * t) * 0.5 + 0.5;
    g = mix(0.2, 1.0, g);

    vColor = vec3(speed) * mix(0.5, 1.0, aVertexPosition.y) * mix(uColor0, uColor1, aVertexPosition.z) * g;
}