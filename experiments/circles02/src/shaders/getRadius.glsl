// getRadius.glsl

float getRadius(float colorMap) {

	float r = 1.0 - colorMap;
	r = clamp(r, 0.0, 1.0);
	r = mix(r, 1.0, 0.1);

	return r * 0.05 + 0.005;
}

#pragma glslify: export(getRadius)