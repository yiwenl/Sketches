import { Handle, Position, useUpdateNodeInternals } from "@xyflow/react";
import { CubicBezierEditor } from "./CubicBezierEditor";
import { useEffect } from "react";

const DISPLAY_LABELS: Record<string, string> = {
  contrastBrightness: "Contrast / Brightness",
  hueSaturation: "Hue / Saturation",
};

/** Keys that accept a ValueNode connection — rendered as named target handles. */
const VALUE_HANDLE_KEYS = [
  "contrast",
  "brightness",
  "hue",
  "saturation",
  "radius",
  "strength",
  "exposure",
  "threshold",
];

function getRange(key: string): { min: number; max: number; step: number } {
  if (key === "hue") return { min: 0, max: 360, step: 1 };
  if (key === "contrast" || key === "brightness" || key === "radius" || key === "exposure" || key === "saturation") {
    return { min: 0, max: 2, step: 0.01 };
  }
  return { min: 0, max: 1, step: 0.01 };
}

export function ShaderPassNode({ id, data }: { id: string; data: any }) {
  const updateNodeInternals = useUpdateNodeInternals();

  useEffect(() => {
    updateNodeInternals(id);
  }, [id, updateNodeInternals]);

  const { label, params, onParamChange } = data;

  const numericParamKeys = Object.keys(params).filter(
    (k) => typeof params[k] === "number"
  );

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
      {/* Main image pipeline — image in */}
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

      {/* Named ValueNode target handles — one per numeric param */}
      {numericParamKeys.filter((k) => VALUE_HANDLE_KEYS.includes(k)).map(
        (key, i) => (
          <Handle
            key={key}
            type="target"
            position={Position.Left}
            id={`${key}-in`}
            style={{
              background: "var(--color-status-warning)",
              width: "7px",
              height: "7px",
              top: `${56 + i * 44}px`,
            }}
          />
        )
      )}

      <div
        style={{
          marginBottom: "16px",
          textAlign: "left",
          fontSize: "18px",
          fontWeight: 600,
          color: "var(--color-text-primary)",
        }}
      >
        {DISPLAY_LABELS[label] ?? label}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
        {Object.keys(params).map((key) => {
          const val = params[key];

          if (typeof val === "number") {
            const { min, max, step } = getRange(key);

            return (
              <div
                key={key}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  marginBottom: "12px",
                }}
              >
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
                    {key}
                  </label>
                  <input
                    className="nodrag composer-slider"
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={val}
                    onChange={(e) =>
                      onParamChange(key, parseFloat(e.target.value))
                    }
                    style={{ flex: 1, margin: "0 10px" }}
                  />
                  <input
                    className="nodrag"
                    type="number"
                    step={step}
                    value={val}
                    onChange={(e) =>
                      onParamChange(key, parseFloat(e.target.value))
                    }
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
            );
          }

          if (Array.isArray(val) && val.length === 4) {
            return (
              <div
                key={key}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  marginTop: "8px",
                  marginBottom: "8px",
                }}
              >
                {key.toLowerCase() !== label.toLowerCase() && (
                  <label
                    style={{
                      fontSize: "13px",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {key}
                  </label>
                )}
                <div style={{ alignSelf: "center" }}>
                  <CubicBezierEditor
                    value={val as [number, number, number, number]}
                    onChange={(newVal) => onParamChange(key, newVal)}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "4px",
                    width: "220px",
                    alignSelf: "center",
                  }}
                >
                  {val.map((v, i) => (
                    <input
                      className="nodrag"
                      key={i}
                      type="number"
                      step="0.01"
                      value={v}
                      onChange={(e) => {
                        const newArr = [...val];
                        newArr[i] = parseFloat(
                          parseFloat(e.target.value).toFixed(2)
                        );
                        onParamChange(key, newArr);
                      }}
                      style={{
                        flex: 1,
                        minWidth: 0,
                        background: "var(--color-bg-canvas)",
                        color: "var(--color-text-primary)",
                        border: "1px solid var(--color-border-subtle)",
                        borderRadius: "6px",
                        font: "inherit",
                        fontSize: "14px",
                        padding: "4px 2px",
                        textAlign: "center",
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>

      {/* Main image pipeline — image out */}
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
