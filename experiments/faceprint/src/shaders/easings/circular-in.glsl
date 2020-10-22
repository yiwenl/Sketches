float circularIn(float t) {
  return 1.0 - sqrt(1.0 - t * t);
}

#pragma glslify: export(circularIn)
