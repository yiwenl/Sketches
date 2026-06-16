export function createParticleShadowRadius({ maxRadius, overshootMultiplier, billboardPadding = 0, }) {
    return maxRadius * overshootMultiplier + billboardPadding;
}
