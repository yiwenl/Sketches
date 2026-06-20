/**
 * Evaluates a cubic Bézier curve at parameter t.
 * The curve goes from 0 to 1 with two control points (x1,y1) and (x2,y2),
 * matching the CSS cubic-bezier() convention.
 *
 * Parametric form:
 *   B(t) = 3(1-t)²t·p1 + 3(1-t)t²·p2 + t³   where p0=0, p3=1
 */
function bezierComponent(t: number, p1: number, p2: number): number {
  return 3 * (1 - t) * (1 - t) * t * p1 + 3 * (1 - t) * t * t * p2 + t * t * t;
}

function bezierComponentDerivative(t: number, p1: number, p2: number): number {
  return (
    3 * (1 - t) * (1 - 2 * t) * p1 +
    3 * t * (2 - 3 * t) * p2 +
    3 * t * t
  );
}

/**
 * Given a CSS cubic-bezier curve [x1, y1, x2, y2] and an input x in [0, 1],
 * finds the corresponding y value on the curve.
 *
 * Uses Newton's method to invert the X component, then evaluates Y at that t.
 * Falls back to bisection if Newton diverges.
 */
export function sampleCubicBezier(
  curve: [number, number, number, number],
  x: number
): number {
  const [x1, y1, x2, y2] = curve;

  // Clamp input
  const xClamped = Math.max(0, Math.min(1, x));

  if (xClamped === 0) return 0;
  if (xClamped === 1) return 1;

  // Newton's method to find t such that bezierX(t) ≈ xClamped
  let t = xClamped; // initial guess

  for (let i = 0; i < 8; i++) {
    const xVal = bezierComponent(t, x1, x2) - xClamped;
    const dxdt = bezierComponentDerivative(t, x1, x2);

    if (Math.abs(dxdt) < 1e-10) break;

    const tNext = t - xVal / dxdt;

    if (Math.abs(tNext - t) < 1e-7) {
      t = tNext;
      break;
    }

    t = tNext;
  }

  // Clamp t to [0, 1] in case Newton overshot
  t = Math.max(0, Math.min(1, t));

  return bezierComponent(t, y1, y2);
}

/**
 * Linearly interpolates between a and b using factor f in [0, 1].
 */
export function lerp(a: number, b: number, f: number): number {
  return a + (b - a) * f;
}

/**
 * Convenience: samples the curve at position x and maps the result to [a, b].
 */
export function rampMix(
  curve: [number, number, number, number],
  position: number,
  a: number,
  b: number
): number {
  return lerp(a, b, sampleCubicBezier(curve, position));
}
