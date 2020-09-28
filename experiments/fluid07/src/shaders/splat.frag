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


void main () {
    vec2 p          = vTextureCoord - point.xy;
    p.x             *= aspectRatio;
    
    float t         = uTime * 0.1;
    vec2 uv         = vTextureCoord;
    uv.x            = uv.x - uTime * 0.01;
    uv.y            = uv.y + sin(uTime * 0.04883974) * 0.1;
    uv              *= 1.2789145;
    vec3 colorMap   = vec3(1.0);
    // colorMap        = mix(colorMap, vec3(1.0), uIsVelocity);
    
    
    float percent   = exp(-dot(p, p) / radius);
    percent         = smoothstep(0.0, 0.5, percent);
    
    
    float force     = length(color.xy);
    vec2 dir       = normalize(p);
    vec3 colorVel   = vec3(dir * force, 1.0);
    colorVel        = mix(color, colorVel, .5);
    vec3 colorFinal = mix(color, colorVel, uIsVelocity);
    vec3 splat      = percent * colorFinal * colorMap;
    
    vec3 base       = texture2D(uTarget, vTextureCoord).xyz;
    gl_FragColor    = vec4(base + splat, 1.0);
}