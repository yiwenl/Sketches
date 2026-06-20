import { Handle, Position, useUpdateNodeInternals } from "@xyflow/react";
import { useEffect, useMemo } from "react";
import { CubicBezierEditor } from "./CubicBezierEditor";
import { rampMix } from "../utils/bezierSample";

interface RampNodeData {
  valueA: number;
  valueB: number;
  position: number;
  curve: [number, number, number, number];
  onDataChange: (key: string, val: any) => void;
}

const HANDLE_COLOR = "var(--color-status-warning)";

const sliderRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const numberInputStyle: React.CSSProperties = {
  width: "50px",
  background: "var(--color-bg-canvas)",
  color: "var(--color-text-primary)",
  border: "1px solid var(--color-border-subtle)",
  borderRadius: "6px",
  font: "inherit",
  fontSize: "13px",
  padding: "4px 6px",
  textAlign: "right",
  flexShrink: 0,
};

const labelStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "var(--color-text-secondary)",
  flex: "0 0 20px",
};

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div style={sliderRowStyle}>
      <span style={labelStyle}>{label}</span>
      <input
        className="nodrag composer-slider"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ flex: 1 }}
      />
      <input
        className="nodrag"
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={numberInputStyle}
      />
    </div>
  );
}

export function RampNode({ id, data }: { id: string; data: RampNodeData }) {
  const updateNodeInternals = useUpdateNodeInternals();

  useEffect(() => {
    updateNodeInternals(id);
  }, [id, updateNodeInternals]);

  const {
    valueA = 0,
    valueB = 1,
    position = 0.5,
    curve = [0.33, 0.33, 0.66, 0.66] as [number, number, number, number],
    onDataChange,
  } = data;

  const outputValue = useMemo(
    () => rampMix(curve, position, valueA, valueB),
    [curve, position, valueA, valueB]
  );

  const handleStyle = (top: number): React.CSSProperties => ({
    background: HANDLE_COLOR,
    width: "8px",
    height: "8px",
    top: `${top}px`,
    left: "-4px",
  });

  return (
    <div
      style={{
        background: "transparent",
        color: "var(--color-text-primary)",
        padding: "16px",
        minWidth: "260px",
        fontFamily: '"DM Sans", sans-serif',
        fontSize: "1rem",
        fontWeight: 400,
        position: "relative",
      }}
    >
      {/* ── Named target handles ── */}
      <Handle type="target" position={Position.Left} id="a-in" style={handleStyle(52)} />
      <Handle type="target" position={Position.Left} id="b-in" style={handleStyle(96)} />
      <Handle type="target" position={Position.Left} id="position-in" style={handleStyle(140)} />

      {/* ── Title ── */}
      <div
        style={{
          marginBottom: "14px",
          fontSize: "18px",
          fontWeight: 600,
          color: "var(--color-text-primary)",
        }}
      >
        Ramp
      </div>

      {/* ── A / B / Position sliders ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px" }}>
        <SliderRow
          label="A"
          value={valueA}
          min={0}
          max={2}
          step={0.01}
          onChange={(v) => onDataChange("valueA", v)}
        />
        <SliderRow
          label="B"
          value={valueB}
          min={0}
          max={2}
          step={0.01}
          onChange={(v) => onDataChange("valueB", v)}
        />
        <SliderRow
          label="t"
          value={position}
          min={0}
          max={1}
          step={0.01}
          onChange={(v) => onDataChange("position", v)}
        />
      </div>

      {/* ── Curve editor ── */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
        <CubicBezierEditor
          value={curve}
          onChange={(v) => onDataChange("curve", v)}
        />
      </div>

      {/* ── Output preview ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: "6px",
          padding: "6px 10px",
          background: "var(--color-bg-canvas)",
          borderRadius: "8px",
          border: "1px solid var(--color-border-subtle)",
        }}
      >
        <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>out</span>
        <span
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "var(--color-status-warning)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {outputValue.toFixed(3)}
        </span>
      </div>

      {/* ── Source handle ── */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        style={{
          background: HANDLE_COLOR,
          width: "10px",
          height: "10px",
          top: "24px",
        }}
      />
    </div>
  );
}
