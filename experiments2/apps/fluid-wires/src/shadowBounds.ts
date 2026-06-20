export interface ParticleShadowRadiusOptions {
  maxRadius: number;
  overshootMultiplier: number;
  billboardPadding?: number;
}

export function createParticleShadowRadius({
  maxRadius,
  overshootMultiplier,
  billboardPadding = 0,
}: ParticleShadowRadiusOptions): number {
  return maxRadius * overshootMultiplier + billboardPadding;
}
