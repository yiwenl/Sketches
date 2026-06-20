import React, { useState, useRef, useCallback } from "react";

interface CubicBezierEditorProps {
  value: [number, number, number, number];
  onChange: (value: [number, number, number, number]) => void;
}

export function CubicBezierEditor({ value, onChange }: CubicBezierEditorProps) {
  const [x1, y1, x2, y2] = value;
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<"p1" | "p2" | null>(null);

  const SIZE = 220; // SVG size
  const PADDING = 8; // Padding to allow points to go slightly out of bounds if needed

  // Convert normalized [0, 1] to SVG coordinates
  const toSVG = (nx: number, ny: number) => ({
    x: PADDING + nx * SIZE,
    y: PADDING + (1 - ny) * SIZE,
  });

  // Convert SVG coordinates back to normalized [0, 1]
  const fromSVG = (sx: number, sy: number) => {
    const nx = (sx - PADDING) / SIZE;
    const ny = 1 - (sy - PADDING) / SIZE;
    // Clamp to [0, 1] for x, but let y exceed if desired (Tweakpane allows y out of bounds usually, but let's clamp for simplicity first, or just clamp X)
    return {
      nx: Math.max(0, Math.min(1, nx)),
      ny: ny, 
    };
  };

  const p0 = toSVG(0, 0);
  const p1 = toSVG(x1, y1);
  const p2 = toSVG(x2, y2);
  const p3 = toSVG(1, 1);

  const handlePointerDown = (e: React.PointerEvent, point: "p1" | "p2") => {
    e.preventDefault();
    setDragging(point);
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging || !svgRef.current) return;

    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;

    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    
    const cursorPt = pt.matrixTransform(ctm.inverse());
    const sx = cursorPt.x;
    const sy = cursorPt.y;

    const { nx, ny } = fromSVG(sx, sy);

    const nxRound = parseFloat(nx.toFixed(2));
    const nyRound = parseFloat(ny.toFixed(2));

    if (dragging === "p1") {
      onChange([nxRound, nyRound, x2, y2]);
    } else if (dragging === "p2") {
      onChange([x1, y1, nxRound, nyRound]);
    }
  }, [dragging, x1, y1, x2, y2, onChange]);

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragging) {
      setDragging(null);
      (e.target as Element).releasePointerCapture(e.pointerId);
    }
  };

  return (
    <div className="nodrag" style={{ touchAction: "none" }}>
      <svg
        ref={svgRef}
        width={SIZE + PADDING * 2}
        height={SIZE + PADDING * 2}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          overflow: "visible",
          cursor: dragging ? "grabbing" : "default"
        }}
      >
        {/* Grid / Frame */}
        <rect x={PADDING} y={PADDING} width={SIZE} height={SIZE} fill="var(--color-bg-canvas)" stroke="var(--color-border-subtle)" strokeWidth="1" />
        {/* Diagonal Reference */}
        <line x1={p0.x} y1={p0.y} x2={p3.x} y2={p3.y} stroke="var(--color-text-muted)" strokeWidth="1" strokeDasharray="4 4" />
        
        {/* Handles lines */}
        <line x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} stroke="var(--color-border-strong)" strokeWidth="2" />
        <line x1={p3.x} y1={p3.y} x2={p2.x} y2={p2.y} stroke="var(--color-border-strong)" strokeWidth="2" />

        {/* The Curve */}
        <path
          d={`M ${p0.x},${p0.y} C ${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`}
          fill="none"
          stroke="var(--color-accent-cyan)"
          strokeWidth="3"
        />

        {/* Start / End points */}
        <circle cx={p0.x} cy={p0.y} r="3" fill="var(--color-text-primary)" />
        <circle cx={p3.x} cy={p3.y} r="3" fill="var(--color-text-primary)" />

        {/* Control point 1 */}
        <circle
          cx={p1.x}
          cy={p1.y}
          r="5"
          fill={dragging === "p1" ? "var(--color-accent-cyan-hover)" : "var(--color-surface-hover)"}
          stroke="var(--color-text-primary)"
          strokeWidth="2"
          onPointerDown={(e) => handlePointerDown(e, "p1")}
          style={{ cursor: "grab" }}
        />
        
        {/* Control point 2 */}
        <circle
          cx={p2.x}
          cy={p2.y}
          r="5"
          fill={dragging === "p2" ? "var(--color-accent-cyan-hover)" : "var(--color-surface-hover)"}
          stroke="var(--color-text-primary)"
          strokeWidth="2"
          onPointerDown={(e) => handlePointerDown(e, "p2")}
          style={{ cursor: "grab" }}
        />
      </svg>
    </div>
  );
}
