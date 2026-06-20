# Start Node and End Node

## StartNode

**Type key:** `start`  
**File:** `src/nodes/StartNode.tsx`

The entry point of every pipeline. It represents the raw canvas texture before any post-processing is applied.

- One **source** handle on the right side.
- No parameters.
- Always has the fixed node ID `"start"`.

### Usage

The Start node is created automatically when a `PipelineConfig` is loaded. You cannot add a second Start node.

---

## EndNode

**Type key:** `end`  
**File:** `src/nodes/EndNode.tsx`

The final node in every pipeline. It represents the composited output sent to the screen.

- One **target** handle on the left side.
- No parameters.
- Always has the fixed node ID `"end"`.

### Usage

The End node is created automatically alongside Start. Connect the last pass node's source handle to End's target handle to complete the pipeline.
