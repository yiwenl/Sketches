import { Handle, Position, useUpdateNodeInternals } from "@xyflow/react";
import { useEffect } from "react";

interface ColorNodeData {
  color: string;
  onColorChange: (color: string) => void;
}

export function ColorNode({ id, data }: { id: string; data: ColorNodeData }) {
  const updateNodeInternals = useUpdateNodeInternals();

  useEffect(() => {
    updateNodeInternals(id);
  }, [id, updateNodeInternals]);

  const { color = "#ffffff", onColorChange } = data;

  return (
    <div
      style={{
        background: "transparent",
        color: "var(--color-text-primary)",
        padding: "16px",
        minWidth: "160px",
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
        Color
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {/* Color swatch + native picker */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              background: color,
              border: "1px solid var(--color-border-subtle)",
              flexShrink: 0,
            }}
          />
          <input
            className="nodrag"
            type="color"
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
            style={{
              width: "100%",
              height: "36px",
              border: "1px solid var(--color-border-subtle)",
              borderRadius: "8px",
              background: "var(--color-bg-canvas)",
              cursor: "pointer",
              padding: "2px 4px",
            }}
          />
        </div>

        {/* Hex text input */}
        <input
          className="nodrag"
          type="text"
          value={color}
          onChange={(e) => {
            const val = e.target.value;
            if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
              onColorChange(val);
            }
          }}
          style={{
            background: "var(--color-bg-canvas)",
            color: "var(--color-text-primary)",
            border: "1px solid var(--color-border-subtle)",
            borderRadius: "6px",
            font: "inherit",
            fontSize: "13px",
            padding: "4px 8px",
            width: "100%",
            boxSizing: "border-box",
            fontFamily: "monospace",
          }}
        />
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="output"
        style={{
          background: "var(--color-accent-cyan)",
          width: "10px",
          height: "10px",
          top: "24px",
        }}
      />
    </div>
  );
}
