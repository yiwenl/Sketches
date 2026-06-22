# Ramp Node

**Type key:** `rampNode`  
**File:** `src/nodes/RampNode.tsx`  
**Toolbar button:** Ramp (amber left border, Values group)

A value supplier node that blends two numbers using a cubic Bézier curve. Inspired by Houdini's ramp parameter — the curve shape controls *how* the blend transitions from A to B as you move through the position range.

## Formula

```
blendFactor = sampleCubicBezier(curve, position)   // 0–1
output      = A + (B − A) × blendFactor
```

The curve is a CSS cubic-bezier `(x1, y1, x2, y2)` mapping position `x ∈ [0, 1]` to a blend factor `y ∈ [0, 1]`. Sampling at a given X uses Newton's method to invert the parametric equation (`src/utils/bezierSample.ts`).

## Handles

| Handle | Side | Type | ID | Colour |
|--------|------|------|----|--------|
| Value A input | Left | target | `a-in` | Amber |
| Value B input | Left | target | `b-in` | Amber |
| Position input | Left | target | `position-in` | Amber |
| Mixed output | Right | source | `output` | Amber |

## Node data

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `valueA` | `number` | `0` | Start value (when position = 0 and curve = linear) |
| `valueB` | `number` | `1` | End value (when position = 1 and curve = linear) |
| `position` | `number` | `0.5` | Where to sample the curve, range 0–1 |
| `curve` | `[x1, y1, x2, y2]` | `[0.33, 0.33, 0.66, 0.66]` | Cubic Bézier control points |

## UI

1. **A / B sliders** — set the two values to blend between (range 0–2 by default).
2. **t slider** — the position at which the curve is sampled (0 = full A, 1 = full B, but the curve can make the transition non-linear at any point in between).
3. **Cubic Bézier editor** — the same interactive SVG editor used in the Curve pass node. Drag the two control points to shape the blend profile.
4. **Output preview** — a live readout (e.g. `out 0.742`) showing the current computed result.

## Wiring ValueNodes into Ramp inputs

All three inputs support ValueNode connections. This lets you animate or drive the blend parameters from upstream nodes:

```
[Value 0.2] ──(output → a-in)──────────────► [Ramp] ──(output → contrast-in)──► [Contrast+Bright]
[Value 1.8] ──(output → b-in)──────────────► [Ramp]
[Value 0.7] ──(output → position-in)───────► [Ramp]
```

When a ValueNode is wired in, its value overrides the inline slider for that input.

## Curve shapes and their effect

| Curve | Blend behaviour |
|-------|-----------------|
| Linear `[0.33, 0.33, 0.66, 0.66]` | Smooth, even interpolation |
| Ease-in `[0.42, 0, 1, 1]` | Slow start, fast finish |
| Ease-out `[0, 0, 0.58, 1]` | Fast start, slow finish |
| Ease-in-out `[0.42, 0, 0.58, 1]` | Slow at both ends, fast in the middle |
| Step (S-curve) `[0.9, 0, 0.1, 1]` | Holds A, sharp snap to B |

## Connecting the output to a pass node

The `output` handle emits a number and is compatible with any amber named target handle on shader pass nodes:

| Pass node | Target handle | Effect |
|-----------|--------------|--------|
| Contrast | `contrast-in` | Drives contrast with a curved blend |
| ContrastBrightness | `brightness-in` | Drives brightness |
| HueSaturation | `saturation-in` | Drives saturation |
| Vignette | `radius-in` | Drives vignette radius |
| Color Lookup | `strength-in` | Drives LUT blend strength |

## Example: soft contrast ramp

Place a Ramp node set to A=0.8, B=1.6, position=0.5 with an ease-in curve, and wire its output to `contrast-in` on a Contrast node. The effective contrast will be roughly 1.2, but the curve means that small changes to the position slider near 0 have little effect while changes near 1 have a large effect — useful for fine-tuning with a non-linear feel.
