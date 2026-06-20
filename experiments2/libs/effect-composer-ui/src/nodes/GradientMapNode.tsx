import { Handle, Position, useUpdateNodeInternals } from "@xyflow/react";
import { useEffect } from "react";

interface GradientMapNodeData {
  color1: string;
  color2: string;
  onParamChange: (key: string, val: any) => void;
}

export function GradientMapNode({
  id,
  data,
}: {
  id: string;
  data: GradientMapNodeData;
}) {
  const updateNodeInternals = useUpdateNodeInternals();

  useEffect(() => {
    updateNodeInternals(id);
  }, [id, updateNodeInternals]);

  const { color1 = "#000000", color2 = "#ffffff", onParamChange } = data;

  const handleHexChange = (key: "color1" | "color2", val: string) => {
    if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
      onParamChange(key, val);
    }
  };

  const colorRowStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    position: "relative",
  };

  const swatchStyle = (hex: string): React.CSSProperties => ({
    width: "28px",
    height: "28px",
    borderRadius: "6px",
    background: hex,
    border: "1px solid var(--color-border-subtle)",
    flexShrink: 0,
  });

  const rowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  const hexInputStyle: React.CSSProperties = {
    background: "var(--color-bg-canvas)",
    color: "var(--color-text-primary)",
    border: "1px solid var(--color-border-subtle)",
    borderRadius: "6px",
    font: "inherit",
    fontSize: "12px",
    padding: "3px 6px",
    flex: 1,
    fontFamily: "monospace",
  };

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
        position: "relative",
      }}
    >
      {/* Main image pipeline — target on the left */}
      <Handle
        type="target"
        position={Position.Left}
        id="target"
        style={{
          background: "var(--color-border-subtle)",
          width: "10px",
          height: "10px",
          top: "24px",
        }}
      />

      <div
        style={{
          marginBottom: "14px",
          fontSize: "18px",
          fontWeight: 600,
          color: "var(--color-text-primary)",
        }}
      >
        Gradient Map
      </div>

      {/* Gradient preview strip */}
      <div
        style={{
          height: "16px",
          borderRadius: "6px",
          background: `linear-gradient(to right, ${color1}, ${color2})`,
          border: "1px solid var(--color-border-subtle)",
          marginBottom: "14px",
        }}
      />

      {/* Shadow color */}
      <div style={{ ...colorRowStyle, marginBottom: "10px" }}>
        <label style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
          Shadow
        </label>
        <div style={rowStyle}>
          <div style={swatchStyle(color1)} />
          <input
            className="nodrag"
            type="text"
            value={color1}
            onChange={(e) => handleHexChange("color1", e.target.value)}
            style={hexInputStyle}
          />
        </div>
        <Handle
          type="target"
          position={Position.Left}
          id="color1-in"
          style={{
            background: "var(--color-accent-cyan)",
            width: "8px",
            height: "8px",
            left: "-20px",
            top: "auto",
            bottom: "0",
          }}
        />
      </div>

      {/* Highlight color */}
      <div style={colorRowStyle}>
        <label style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
          Highlight
        </label>
        <div style={rowStyle}>
          <div style={swatchStyle(color2)} />
          <input
            className="nodrag"
            type="text"
            value={color2}
            onChange={(e) => handleHexChange("color2", e.target.value)}
            style={hexInputStyle}
          />
        </div>
        <Handle
          type="target"
          position={Position.Left}
          id="color2-in"
          style={{
            background: "var(--color-accent-cyan)",
            width: "8px",
            height: "8px",
            left: "-20px",
            top: "auto",
            bottom: "0",
          }}
        />
      </div>

      {/* Main image pipeline — source on the right */}
      <Handle
        type="source"
        position={Position.Right}
        id="source"
        style={{
          background: "var(--color-border-subtle)",
          width: "10px",
          height: "10px",
          top: "24px",
        }}
      />
    </div>
  );
}
