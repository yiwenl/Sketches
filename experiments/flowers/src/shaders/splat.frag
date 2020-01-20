precision highp float;
precision mediump sampler2D;

varying vec2 vTextureCoord;
uniform sampler2D uTarget;
uniform sampler2D texture;
uniform float aspectRatio;
uniform vec3 color;
uniform vec2 point;
uniform float radius;
uniform float uTime;
uniform float uIsVelocity;


#pragma glslify: curlNoise = require(glsl-utils/curlNoise.glsl)
#define PI 3.141592653

float getPercent(vec2 uvOffset, inout vec2 dir) {
    vec2 p  = vTextureCoord + uvOffset - point.xy;
    p.x     *= aspectRatio;
    if(length(p) < radius) {
        dir += normalize(p);
    }
    return exp(-dot(p, p) / radius);
}


vec3 getSpherePos(vec2 uv) {
    float ax = (uv.y - 0.5) * PI;
    float ay = uv.x * PI * 2.0;

    float y = sin(ax);
    float r = cos(ax);
    float x = cos(ay) * r;
    float z = sin(ay) * r;

    return vec3(x, y, z);
}


void main () {
    vec2 dir = vec2(0.0);
    vec3 posSphere = getSpherePos(vTextureCoord);
    vec3 colorMap    = vec3(1.0);

    float uNoise = 2.0;
    vec3 noise = curlNoise(posSphere * uNoise + uTime);
    if(uIsVelocity < 0.5) {
        float p  = abs(noise.r);
        noise = vec3(p);
    }
    
    
    float percent0   = getPercent(vec2(-1.0, 0.0), dir);
    float percent1   = getPercent(vec2( 0.0, 0.0), dir);
    float percent2   = getPercent(vec2( 1.0, 0.0), dir);

    dir = normalize(dir * 0.1);

    float percent = percent0 + percent1 + percent2;
    
    
    float force     = length(color.xy);
    vec3 colorVel   = vec3(dir * force, 1.0);
    colorVel        = mix(color, colorVel, .5);
    vec3 colorFinal = mix(color * noise, colorVel, uIsVelocity);
    vec3 splat      = percent * colorFinal * colorMap;
    
    vec3 base       = texture2D(uTarget, vTextureCoord).xyz;
    gl_FragColor    = vec4(base + splat, 1.0);
}