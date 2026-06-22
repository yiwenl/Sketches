import { Node } from "@xyflow/react";

export interface NodeHandlers {
  handleParamChange: (id: string, key: string, val: any) => void;
  handleColorNodeChange: (id: string, color: string) => void;
  handleValueNodeChange: (id: string, value: number) => void;
  handleRampNodeChange: (id: string, key: string, val: any) => void;
}

/**
 * Re-attaches the correct callback(s) to each node after deserialisation.
 * Callbacks are not JSON-serialisable so they must be re-injected whenever a
 * node array is restored from a stored graph or an imported file.
 */
export function restoreNodeCallbacks(
  nodes: Node[],
  handlers: NodeHandlers
): Node[] {
  const { handleParamChange, handleColorNodeChange, handleValueNodeChange, handleRampNodeChange } = handlers;

  return nodes.map((n) => {
    switch (n.type) {
      case "shaderPass":
      case "gradientMap":
      case "colorLookup":
        return {
          ...n,
          data: {
            ...n.data,
            onParamChange: (key: string, val: any) => handleParamChange(n.id, key, val),
          },
        };
      case "colorNode":
        return {
          ...n,
          data: {
            ...n.data,
            onColorChange: (color: string) => handleColorNodeChange(n.id, color),
          },
        };
      case "valueNode":
        return {
          ...n,
          data: {
            ...n.data,
            onValueChange: (value: number) => handleValueNodeChange(n.id, value),
          },
        };
      case "rampNode":
        return {
          ...n,
          data: {
            ...n.data,
            onDataChange: (key: string, val: any) => handleRampNodeChange(n.id, key, val),
          },
        };
      default:
        return n;
    }
  });
}
