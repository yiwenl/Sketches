import { Handle, Position, useUpdateNodeInternals } from "@xyflow/react";
import { useEffect } from "react";

export function StartNode({ id }: { id: string }) {
  const updateNodeInternals = useUpdateNodeInternals();
  useEffect(() => {
    updateNodeInternals(id);
  }, [id, updateNodeInternals]);
  return (
    <div
      style={{
        background: "transparent", // handled by .react-flow__node
        color: "var(--color-text-secondary)",
        padding: "16px",
        borderRadius: "16px",
        minWidth: "120px",
        fontFamily: '"DM Sans", sans-serif',
        fontSize: "1rem",
        fontWeight: 500,
        textAlign: "center",
      }}
    >
      <div>Input (Canvas)</div>
      <Handle type="source" position={Position.Right} style={{ background: "var(--color-border-subtle)", width: "10px", height: "10px", top: "24px" }} />
    </div>
  );
}
