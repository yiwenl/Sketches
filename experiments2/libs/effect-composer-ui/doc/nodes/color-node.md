# Color Node

**Type key:** `colorNode`  
**File:** `src/nodes/ColorNode.tsx`  
**Toolbar button:** Color (cyan left border)

A value supplier node that holds a single hex colour. It does not sit in the image pipeline — instead, wire its output handle into a named colour input on a pass node to drive that colour parameter from a shared source.

## Handles

| Handle | Side | Type | ID | Colour |
|--------|------|------|----|--------|
| Output | Right | source | `output` | Cyan |

## Node data

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `color` | `string` (hex) | `"#aee6ff"` | The currently selected colour |

## UI

- A colour swatch showing the current selection.
- A native `<input type="color">` browser colour picker.
- A hex text field for precise entry (validates `#RRGGBB` format).

## Connecting to pass nodes

Connect the cyan source handle to any cyan target handle on a pass node. Currently supported targets:

| Pass node | Target handle | Parameter overridden |
|-----------|--------------|----------------------|
| Gradient Map | `color1-in` | Shadow color (`color1`) |
| Gradient Map | `color2-in` | Highlight color (`color2`) |

When the Color node is connected, the pass node's inline colour picker becomes a fallback only — the connected value takes precedence in the exported `PipelineConfig`.

## Example

```
[Color #ff6600] ──(output → color1-in)──► [Gradient Map]
[Color #001eff] ──(output → color2-in)──► [Gradient Map]
```

Changing the Color node's picker live-updates the gradient map preview and the emitted config.
