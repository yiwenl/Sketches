import { Handle, Position, useUpdateNodeInternals } from "@xyflow/react";
import { useEffect } from "react";

interface ValueNodeData {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  onValueChange: (value: number) => void;
}

export function ValueNode({ id, data }: { id: string; data: ValueNodeData }) {
  const updateNodeInternals = useUpdateNodeInternals();

  useEffect(() => {
    updateNodeInternals(id);
  }, [id, updateNodeInternals]);

  const {
    value = 0,
    min = 0,
    max = 1,
    step = 0.01,
    label = "Value",
    onValueChange,
  } = data;

  return (
    <div
      style={{
        background: "transparent",
        color: "var(--color-text-primary)",
        padding: "16px",
        minWidth: "200px",
        fontFamily: '"DM Sans", sans-serif',
        fontSize: "1rem",
        fontWeight: 400,
      }}
    >
      <div
        style={{
          marginBottom: "12px",
          textAlign: "left",
          fontSize: "18px",
          fontWeight: 600,
          color: "var(--color-text-primary)",
        }}
      >
        {label}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <input
            className="nodrag composer-slider"
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onValueChange(parseFloat(e.target.value))}
            style={{ flex: 1, marginRight: "10px" }}
          />
          <input
            className="nodrag"
            type="number"
            step={step}
            min={min}
            max={max}
            value={value}
            onChange={(e) => onValueChange(parseFloat(e.target.value))}
            style={{
              width: "56px",
              background: "var(--color-bg-canvas)",
              color: "var(--color-text-primary)",
              border: "1px solid var(--color-border-subtle)",
              borderRadius: "6px",
              font: "inherit",
              fontSize: "13px",
              padding: "4px 6px",
              textAlign: "right",
            }}
          />
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="output"
        style={{
          background: "var(--color-status-warning)",
          width: "10px",
          height: "10px",
          top: "24px",
        }}
      />
    </div>
  );
}
