// render.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;
attribute vec2 aUV;
attribute vec3 aExtra;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform sampler2D textureCurr;
uniform sampler2D textureNext;
uniform sampler2D textureExtra;
uniform float percent;
uniform float time;
uniform vec2 uViewport;

varying vec4 vColor;
varying vec3 vNormal;
varying vec2 vTextureCoord;

const float radius = 0.01;

mat3 calcLookAtMatrix(vec3 origin, vec3 target, float roll) {
  vec3 rr = vec3(sin(roll), cos(roll), 0.0);
  vec3 ww = normalize(target - origin);
  vec3 uu = normalize(cross(ww, rr));
  vec3 vv = normalize(cross(uu, ww));

  return mat3(uu, vv, ww);
}



vec3 lookAt(inout vec3 pos, inout vec3 normal, vec3 origin, vec3 target) {
	mat3 m = calcLookAtMatrix(origin, target, 0.0);
	pos = m * pos;
	normal = m * normal;

	return pos;
}

void main(void) {
	vec2 uv             = aUV;
	vec3 posCurr        = texture2D(textureCurr, uv).rgb;
	vec3 posNext        = texture2D(textureNext, uv).rgb;
	vec3 posOffset      = mix(posCurr, posNext, percent);
	vec3 extra          = texture2D(textureExtra, uv).rgb;
	vec3 position       = aVertexPosition * mix(aExtra, vec3(1.0), .25);
	vec3 normal 		= aNormal;
	lookAt(position, normal, posOffset, posNext+vec3(0.0, 0.0, 0.0001));
	
	position            += posOffset;
	gl_Position         = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(position, 1.0);
	
	
	
	
	float g             = sin(extra.r + time * mix(extra.b, 1.0, .5));
	g                   = smoothstep(0.0, 1.0, g);
	g                   = mix(g, 1.0, .5);
	vColor              = vec4(vec3(g), 1.0);
	
	// float distOffset = uViewport.y * uProjectionMatrix[1][1] * radius / gl_Position.w;
	// gl_PointSize     = distOffset * (1.0 + extra.x * 1.0);
	
	vNormal             = normal;
	vTextureCoord       = aTextureCoord;
}