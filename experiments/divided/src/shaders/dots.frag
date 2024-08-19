#version 300 es

precision highp float;
in float vTheta;
in vec3 vExtra;

uniform sampler2D uNoiseMap;

out vec4 oColor;

float shortestDistanceToSegment(vec2 point, vec2 A, vec2 B) {
    vec2 d = B - A;
    vec2 AP = point - A;
    float dDotD = dot(d, d);
    if (dDotD == 0.0) {
        // A and B are the same point
        return length(AP);
    }

    float t = dot(AP, d) / dDotD;
    if (t < 0.0) {
        return length(AP);  // Distance to A
    } else if (t > 1.0) {
        return length(point - B);  // Distance to B
    }

    vec2 closestPoint = A + t * d;
    return length(point - closestPoint);  // Perpendicular distance to segment
}

#pragma glslify: rotate    = require(./glsl-utils/rotate.glsl)


void main(void) {
    vec2 uv;

    uv = gl_PointCoord * mix(1.4, 2.5, vExtra.y);
    uv += vExtra.yz * 0.5;
    float n = texture(uNoiseMap, uv).r;

    uv = gl_PointCoord - 0.5;
    uv = rotate(uv, vTheta);
    uv += 0.5;
    float t = 0.3;
    vec2 start = vec2(t, 0.5);
    vec2 end = vec2(1.0 - t, 0.5);

    float d = shortestDistanceToSegment(uv, start, end);
    d = smoothstep(-0.1, 0.2, d);
    if(d > n) discard;
    // oColor = vec4(uv, 0.0, 1.0);
    oColor = vec4(1.0, 0.0, 0.0, 1.0);
}