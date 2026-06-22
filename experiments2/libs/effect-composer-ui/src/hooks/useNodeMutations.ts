import { useCallback } from "react";
import { Node, Edge } from "@xyflow/react";

export interface NodeMutations {
  syncDisplayData: (currentNodes: Node[], currentEdges: Edge[]) => Node[];
  handleParamChange: (id: string, key: string, val: any) => void;
  handleColorNodeChange: (id: string, color: string) => void;
  handleValueNodeChange: (id: string, value: number) => void;
  handleRampNodeChange: (id: string, key: string, val: any) => void;
}

interface UseNodeMutationsArgs {
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  edgesRef: React.MutableRefObject<Edge[]>;
}

/**
 * Propagates ColorNode values into the display data of connected nodes
 * (e.g. GradientMapNode color1/color2) so the UI stays in sync with wired
 * connections. This is distinct from resolveParams, which only affects the
 * exported PipelineConfig.
 */
function syncDisplayData(currentNodes: Node[], currentEdges: Edge[]): Node[] {
  return currentNodes.map((n) => {
    if (n.type !== "gradientMap") return n;
    const incoming = currentEdges.filter((e) => e.target === n.id);
    if (incoming.length === 0) return n;

    let data = n.data;
    let changed = false;
    for (const edge of incoming) {
      const src = currentNodes.find((s) => s.id === edge.source);
      if (!src || src.type !== "colorNode") continue;
      const key = edge.targetHandle?.replace("-in", "");
      if (
        (key === "color1" || key === "color2") &&
        typeof src.data.color === "string" &&
        data[key] !== src.data.color
      ) {
        data = { ...data, [key]: src.data.color };
        changed = true;
      }
    }
    return changed ? { ...n, data } : n;
  });
}

export function useNodeMutations({ setNodes, edgesRef }: UseNodeMutationsArgs): NodeMutations {
  const handleParamChange = useCallback(
    (id: string, key: string, val: any) => {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id !== id) return n;
          if (n.type === "gradientMap" || n.type === "colorLookup") {
            return { ...n, data: { ...n.data, [key]: val } };
          }
          return {
            ...n,
            data: { ...n.data, params: { ...(n.data.params || {}), [key]: val } },
          };
        })
      );
    },
    [setNodes]
  );

  const handleColorNodeChange = useCallback(
    (id: string, color: string) => {
      setNodes((nds) => {
        const withColor = nds.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, color } } : n
        );
        return syncDisplayData(withColor, edgesRef.current);
      });
    },
    [setNodes, edgesRef]
  );

  const handleValueNodeChange = useCallback(
    (id: string, value: number) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, value } } : n))
      );
    },
    [setNodes]
  );

  const handleRampNodeChange = useCallback(
    (id: string, key: string, val: any) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, [key]: val } } : n
        )
      );
    },
    [setNodes]
  );

  return {
    syncDisplayData,
    handleParamChange,
    handleColorNodeChange,
    handleValueNodeChange,
    handleRampNodeChange,
  };
}
