#version 300 es

precision highp float;
in vec2 vTextureCoord;
uniform sampler2D uPosMap;
uniform sampler2D uDataMap;
uniform sampler2D uExtraMap;
uniform sampler2D uHeightMap;
uniform float uTime;

layout (location = 0) out vec4 oFragColor0;
layout (location = 1) out vec4 oFragColor1;
layout (location = 2) out vec4 oFragColor2;

float getHeight(vec3 pos) {
    vec2 uv = pos.xz * .5 + .5;
    uv.y = 1.0 - uv.y;

    return texture(uHeightMap, uv).x;
}


// Parameters
#define MOVE_RANGE 0.04
#define MIN_LIFE 0.01
#define SLOPE_THRESHOLD 0.1

void main(void) {
    vec3 pos = texture(uPosMap, vTextureCoord).xyz;
    vec3 data = texture(uDataMap, vTextureCoord).xyz;
    vec3 extra = texture(uExtraMap, vTextureCoord).xyz;

    vec3 off = vec3(-1.0, 0.0, 1.0) * 0.005;
    // pos.x += off.x;

    float hCurr = getHeight(pos);
    float hLeft = getHeight(pos + off.xyy);
    float hRight = getHeight(pos + off.zyy);
    float hTop = getHeight(pos + off.yyx);
    float hBottom = getHeight(pos + off.yyz);

    float dx = hLeft - hRight;
    float dy = hBottom - hTop;

    pos.x += dx * MOVE_RANGE;
    pos.z -= dy * MOVE_RANGE;

    float speed = (abs(dx) + abs(dy));
    speed = smoothstep(0.02, 0.1, speed);
    data.y = speed;

    float sedimentAmt = data.x * 0.1;

    if(speed > SLOPE_THRESHOLD) {
        data.z += sedimentAmt;
    } else {
        data.z -= sedimentAmt;
    }

    data.z = clamp(data.z, 0.0, 1.0);
    // data.z = max(data.z, 0.0);

    float h = getHeight(pos);
    pos.y = h;

    float decay = mix(0.93, 0.96, extra.x);
    data.x *= decay;

    if(data.x < MIN_LIFE) { // reset drop
        data.x = 1.0;
        pos.xz = fract(extra.xy + uTime * mix(1.0, 3.0, extra.z)) * 2.0 - 1.0;
        pos.y = getHeight(pos);
    }


    oFragColor0 = vec4(pos, 1.0);
    oFragColor1 = vec4(data, 1.0);
    oFragColor2 = vec4(extra, 1.0);
}