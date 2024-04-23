float diffuse(vec3 n, vec3 l) {
  float d = dot(normalize(n), normalize(l));
  return max(d, 0.0);
}

float diffuse(vec3 n, vec3 l, float t) {
  float d = dot(normalize(n), normalize(l));
  return mix(1.0, max(d, 0.0), t);
}

#pragma glslify: export(diffuse)