# Node Composer UI Design Guidelines

Figma source: https://www.figma.com/design/qIvebJ1tL3qKyb1MmXhIGN

These guidelines define the visual system for the Effect Composer node-based UI. The direction is a dark utility canvas inspired by compact creative tools: graphite surfaces, soft cyan focus states, low-contrast borders, and dense controls built for repeated editing.

## Design Principles

### Canvas first
The node workspace should feel quiet and operational. Use a near-black canvas, subtle panel elevation, and avoid decorative gradients or marketing-style surfaces. The graph, controls, and execution path are the focus.

### Cyan means active
Reserve cyan for selected nodes, active connectors, primary actions, and the current execution path. Idle elements should stay graphite or muted gray so the active state remains obvious.

### Compact, tactile controls
Panels, menus, and toolbars should be dense but readable. Prefer 40-48px control heights, 12-16px radii, 1px borders, and clear hover fills.

### DM Sans throughout
Use DM Sans for all UI text. Keep letter spacing at `0`. Avoid oversized typography inside tool surfaces.

## Color Tokens

| Token | Hex | Usage |
| --- | --- | --- |
| `color-bg-app` | `#15161A` | Outer app background |
| `color-bg-canvas` | `#101114` | Composer canvas background |
| `color-surface-base` | `#1B1D22` | Panels and default cards |
| `color-surface-raised` | `#202329` | Toolbars, menu surfaces, list rows |
| `color-surface-hover` | `#32343A` | Hover and selected row fill |
| `color-border-subtle` | `#30343B` | Default 1px border |
| `color-border-strong` | `#474C55` | Active or emphasized borders |
| `color-text-primary` | `#F2F3F5` | Main labels and node titles |
| `color-text-secondary` | `#B3B6BE` | Controls and secondary labels |
| `color-text-muted` | `#747983` | Metadata, placeholders, disabled text |
| `color-accent-cyan` | `#AEE6FF` | Active connectors, selected nodes, primary button |
| `color-accent-cyan-hover` | `#C8F0FF` | Primary hover and bright focus |
| `color-status-debug` | `#E879F9` | Debug log timestamps, special status |
| `color-status-success` | `#8EE6C1` | Valid state or completed run |
| `color-status-warning` | `#F8C77E` | Warnings and recoverable issues |

## Typography

Font family: `DM Sans`

| Style | Size / Line height | Weight | Color | Usage |
| --- | --- | --- | --- | --- |
| Display / Page Title | `32 / 40` | `600` | `color-text-primary` | Guideline headings or major view title |
| Heading / Section | `20 / 28` | `600` | `color-text-primary` | Panel section headings |
| Heading / Node Title | `18 / 24` | `600` | `color-text-primary` | Node names |
| Body / Control | `15 / 22` | `500` | `color-text-secondary` | Buttons, list item labels, inputs |
| Body / Meta | `13 / 18` | `400` | `color-text-secondary` or muted | Node metadata and helper text |
| Label / Tiny Badge | `11 / 14` | `600` | contextual | Keyboard shortcuts and small status badges |
| Code / Debug | `12 / 18` | `400` | `color-text-secondary` | Debug output and code panel text |

## Spacing, Radius, And Stroke

| Token | Value | Usage |
| --- | --- | --- |
| `spacing-2xs` | `4px` | Tight icon/text adjustment |
| `spacing-xs` | `8px` | Badge padding and dense gaps |
| `spacing-sm` | `12px` | Control internal spacing |
| `spacing-md` | `16px` | Panel padding and row gaps |
| `spacing-lg` | `24px` | Section padding |
| `spacing-xl` | `32px` | Major layout gaps |
| `radius-sm` | `8px` | Badges, row hover shapes |
| `radius-md` | `12px` | Buttons and list items |
| `radius-lg` | `16px` | Panels, toolbars, node cards |
| `radius-full` | `999px` | Circular node icons and pills |
| `stroke-default` | `1px` | Panels, rows, inputs |
| `stroke-active` | `2px` | Selected node rings |
| `connector-idle` | `2px` | Inactive connector |
| `connector-active` | `3-4px` | Active connector |

## Shadows

Use shadow sparingly. The canvas should not feel layered with heavy cards.

```css
--shadow-panel-glow: 0 16px 44px -14px rgb(0 0 0 / 28%);
```

## Component Rules

### Composer canvas
- Fill: `color-bg-canvas`.
- Keep background mostly flat.
- Use subtle grid dots or low-opacity grid lines only if needed for orientation.
- Avoid colorful decorative shapes in the graph area.

### Node card
- Fill: `color-surface-base` or `color-bg-app`.
- Border: `1px solid color-border-subtle`.
- Radius: `16-20px`.
- Selected border: cyan, `2px`.
- Title: `18 / 24`, SemiBold, primary text.
- Metadata: `13 / 18`, Regular, secondary or muted text.
- Icon mark: circular, usually `48-72px`, with cyan only for selected or primary nodes.

### Connector
- Idle: `color-border-subtle`, `2px`, opacity near `1`.
- Active: `color-accent-cyan`, `3-4px`.
- Current execution path may use cyan plus a soft glow, but avoid neon saturation.

### Floating toolbar
- Fill: `color-surface-raised`.
- Border: `1px solid color-border-subtle`.
- Radius: `16px`.
- Button size: `44-48px` square.
- Active button fill: `color-surface-hover`.
- Icons: use MUI icons where possible; keep them at `18-22px`.

### Side panel item
- Height: `56-64px` for list rows.
- Fill: `color-surface-raised`.
- Border: `1px solid color-border-subtle`.
- Radius: `12px`.
- Label: `15 / 22`, Medium.
- Icon: `20-24px`, secondary text color.

### Command menu
- Fill: `color-surface-raised`.
- Radius: `14-16px`.
- Row height: `40-48px`.
- Hover fill: `color-surface-hover`.
- Keyboard badges: `color-border-strong` fill, `11 / 14`, SemiBold.
- Use dividers between groups, not between every row.

### Primary action
- Fill: `color-accent-cyan`.
- Text: `#101114`.
- Hover fill: `color-accent-cyan-hover`.
- Radius: `12px`.
- Height: `44-48px`.

## CSS Variables

```css
:root {
  font-family: "DM Sans", system-ui, sans-serif;

  --color-bg-app: #15161a;
  --color-bg-canvas: #101114;
  --color-surface-base: #1b1d22;
  --color-surface-raised: #202329;
  --color-surface-hover: #32343a;
  --color-border-subtle: #30343b;
  --color-border-strong: #474c55;
  --color-text-primary: #f2f3f5;
  --color-text-secondary: #b3b6be;
  --color-text-muted: #747983;
  --color-accent-cyan: #aee6ff;
  --color-accent-cyan-hover: #c8f0ff;
  --color-status-debug: #e879f9;
  --color-status-success: #8ee6c1;
  --color-status-warning: #f8c77e;

  --spacing-2xs: 4px;
  --spacing-xs: 8px;
  --spacing-sm: 12px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-full: 999px;

  --shadow-panel-glow: 0 16px 44px -14px rgb(0 0 0 / 28%);
}
```

## React Flow Styling Notes

Use the React Flow classes as the styling entry points:

```css
.react-flow {
  background: var(--color-bg-canvas);
  color: var(--color-text-primary);
  font-family: "DM Sans", system-ui, sans-serif;
}

.react-flow__node {
  border-radius: var(--radius-lg);
  background: var(--color-surface-base);
  border: 1px solid var(--color-border-subtle);
  color: var(--color-text-primary);
  box-shadow: var(--shadow-panel-glow);
}

.react-flow__node.selected {
  border-color: var(--color-accent-cyan);
  box-shadow: 0 0 0 1px var(--color-accent-cyan), var(--shadow-panel-glow);
}

.react-flow__edge-path {
  stroke: var(--color-border-subtle);
  stroke-width: 2;
}

.react-flow__edge.selected .react-flow__edge-path {
  stroke: var(--color-accent-cyan);
  stroke-width: 3.5;
}
```

## Implementation Checklist

- Load DM Sans in the host app before rendering the composer.
- Move inline toolbar styles into a shared composer stylesheet or theme object.
- Replace default MUI blues with the cyan primary action token.
- Style React Flow nodes through custom node components plus `.react-flow__node.selected`.
- Keep all composer-specific CSS variables scoped to the composer root if this library is embedded in multiple apps.
- Use MUI icons for toolbar and side-panel actions instead of custom text labels where the action is already familiar.
