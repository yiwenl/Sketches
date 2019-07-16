#ifndef PI
#define PI 3.141592653589793
#endif

float backOut(float t) {
  float f = 1.0 - t;
  return 1.0 - (pow(f, 3.0) - f * sin(f * PI));
}

#pragma glslify: export(backOut)
