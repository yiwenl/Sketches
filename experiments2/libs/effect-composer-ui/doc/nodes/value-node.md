# Value Node

**Type key:** `valueNode`  
**File:** `src/nodes/ValueNode.tsx`  
**Toolbar button:** Value (amber left border)

A value supplier node that holds a single number. Wire its output handle into a named numeric parameter handle on any shader pass node to drive that parameter dynamically from a shared source.

> For non-linear blending between two values, see the [Ramp node](ramp-node.md), which accepts ValueNode connections on its A, B, and position inputs.

## Handles

| Handle | Side | Type | ID | Colour |
|--------|------|------|----|--------|
| Output | Right | source | `output` | Amber |

## Node data

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `label` | `string` | `"Value"` | Display title shown in the node header |
| `value` | `number` | `0.5` | The current numeric value |
| `min` | `number` | `0` | Minimum slider bound |
| `max` | `number` | `1` | Maximum slider bound |
| `step` | `number` | `0.01` | Slider and number input step |

## UI

- A range slider spanning the configured `min` / `max`.
- A number input for direct entry.
- Both controls stay in sync.

## Connecting to pass nodes

Connect the amber source handle to any amber (named) target handle on a shader pass node. Named handles correspond to numeric parameters and appear as small amber dots on the left side of the pass node below the main image-in handle.

Currently supported targets:

| Pass node | Target handle | Parameter overridden |
|-----------|--------------|----------------------|
| Contrast | `contrast-in` | `contrast` |
| ContrastBrightness | `contrast-in` | `contrast` |
| ContrastBrightness | `brightness-in` | `brightness` |
| HueSaturation | `hue-in` | `hue` |
| HueSaturation | `saturation-in` | `saturation` |
| Vignette | `radius-in` | `radius` |
| Vignette | `strength-in` | `strength` |

Any other pass that has a numeric parameter with a key in the recognized set will also expose a matching handle automatically.

## Example

```
[Value 1.8] ──(output → contrast-in)──► [Contrast + Brightness]
[Value 0.3] ──(output → brightness-in)─► [Contrast + Brightness]
```

The inline sliders on the pass node become fallbacks when a Value node is connected. The connected value is what gets written into the exported `PipelineConfig`.
