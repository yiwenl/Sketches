import { Handle, Position, useUpdateNodeInternals } from "@xyflow/react";
import { useEffect, useRef } from "react";

interface ColorLookupNodeData {
  lutDataUrl: string | null;
  lutFileName: string | null;
  strength: number;
  flipY: boolean;
  onParamChange: (key: string, val: any) => void;
}

export function ColorLookupNode({
  id,
  data,
}: {
  id: string;
  data: ColorLookupNodeData;
}) {
  const updateNodeInternals = useUpdateNodeInternals();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    updateNodeInternals(id);
  }, [id, updateNodeInternals]);

  const {
    lutDataUrl = null,
    lutFileName = null,
    strength = 1.0,
    flipY = false,
    onParamChange,
  } = data;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      onParamChange("lutDataUrl", url);
      onParamChange("lutFileName", file.name);
    };
    reader.readAsDataURL(file);
    // Reset so re-picking the same file triggers onChange again
    e.target.value = "";
  };

  const handleClear = () => {
    onParamChange("lutDataUrl", null);
    onParamChange("lutFileName", null);
  };

  const handleStrengthChange = (val: number) => {
    onParamChange("strength", val);
  };

  return (
    <div
      style={{
        background: "transparent",
        color: "var(--color-text-primary)",
        padding: "16px",
        minWidth: "220px",
        fontFamily: '"DM Sans", sans-serif',
        fontSize: "1rem",
        fontWeight: 400,
        position: "relative",
      }}
    >
      {/* Main image in */}
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

      {/* Strength value handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="strength-in"
        style={{
          background: "var(--color-status-warning)",
          width: "7px",
          height: "7px",
          top: "160px",
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
        Color Lookup
      </div>

      {/* LUT map upload area */}
      <div style={{ marginBottom: "14px" }}>
        <label
          style={{ fontSize: "13px", color: "var(--color-text-secondary)", display: "block", marginBottom: "6px" }}
        >
          LUT Map
        </label>

        {lutDataUrl ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {/* Thumbnail — click to replace */}
            <img
              src={lutDataUrl}
              alt="LUT preview"
              className="nodrag"
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: "100%",
                height: "48px",
                objectFit: "cover",
                borderRadius: "6px",
                border: "1px solid var(--color-border-subtle)",
                cursor: "pointer",
              }}
              title="Click to replace"
            />
            {/* File name + clear */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span
                style={{
                  fontSize: "11px",
                  color: "var(--color-text-secondary)",
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {lutFileName ?? "lut.png"}
              </span>
              <button
                className="nodrag"
                onClick={handleClear}
                style={{
                  background: "none",
                  border: "1px solid var(--color-border-subtle)",
                  borderRadius: "4px",
                  color: "var(--color-text-secondary)",
                  cursor: "pointer",
                  fontSize: "11px",
                  lineHeight: 1,
                  padding: "2px 6px",
                  flexShrink: 0,
                }}
              >
                ✕
              </button>
            </div>
          </div>
        ) : (
          <button
            className="nodrag"
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: "100%",
              padding: "10px",
              background: "var(--color-bg-canvas)",
              border: "1px dashed var(--color-border-subtle)",
              borderRadius: "6px",
              color: "var(--color-text-secondary)",
              cursor: "pointer",
              fontSize: "12px",
              textAlign: "center",
            }}
          >
            Click to upload PNG
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </div>

      {/* Strength */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "4px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <label
            style={{
              fontSize: "13px",
              color: "var(--color-text-secondary)",
              flex: "0 0 60px",
            }}
          >
            strength
          </label>
          <input
            className="nodrag composer-slider"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={strength}
            onChange={(e) => handleStrengthChange(parseFloat(e.target.value))}
            style={{ flex: 1, margin: "0 10px" }}
          />
          <input
            className="nodrag"
            type="number"
            min={0}
            max={1}
            step={0.01}
            value={strength}
            onChange={(e) => handleStrengthChange(parseFloat(e.target.value))}
            style={{
              width: "50px",
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

      {/* Flip Y */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
        <input
          type="checkbox"
          id={`flipY-${id}`}
          checked={flipY}
          onChange={(e) => onParamChange("flipY", e.target.checked)}
          style={{ marginRight: "8px" }}
        />
        <label
          htmlFor={`flipY-${id}`}
          style={{
            fontSize: "13px",
            color: "var(--color-text-secondary)",
            cursor: "pointer",
          }}
        >
          Flip Y
        </label>
      </div>

      {/* Main image out */}
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
