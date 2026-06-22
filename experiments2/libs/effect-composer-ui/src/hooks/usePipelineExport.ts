import { useCallback } from "react";
import { Node, Edge } from "@xyflow/react";
import { PipelineConfig, PassConfig } from "../types";
import { rampMix } from "../utils/bezierSample";

interface UsePipelineExportArgs {
  onChange?: (config: PipelineConfig) => void;
}

export interface PipelineExport {
  resolveRampValue: (ramp: Node, currentNodes: Node[], currentEdges: Edge[]) => number;
  resolveParams: (node: Node, currentNodes: Node[], currentEdges: Edge[]) => Record<string, any>;
  notifyChange: (currentNodes: Node[], currentEdges: Edge[]) => void;
}

/**
 * Compute the output value of a rampNode, resolving any ValueNode inputs
 * wired into its a-in, b-in, or position-in handles.
 */
function resolveRampValue(
  ramp: Node,
  currentNodes: Node[],
  currentEdges: Edge[]
): number {
  let valueA: number = typeof ramp.data.valueA === "number" ? ramp.data.valueA : 0;
  let valueB: number = typeof ramp.data.valueB === "number" ? ramp.data.valueB : 1;
  let position: number = typeof ramp.data.position === "number" ? ramp.data.position : 0.5;
  const curve = (ramp.data.curve ?? [0.33, 0.33, 0.66, 0.66]) as [number, number, number, number];

  const incomingEdges = currentEdges.filter((e) => e.target === ramp.id);
  for (const edge of incomingEdges) {
    const src = currentNodes.find((n) => n.id === edge.source);
    if (!src) continue;
    const v = src.type === "valueNode" ? src.data.value : undefined;
    if (typeof v !== "number") continue;
    if (edge.targetHandle === "a-in") valueA = v;
    if (edge.targetHandle === "b-in") valueB = v;
    if (edge.targetHandle === "position-in") position = v;
  }

  return rampMix(curve, position, valueA, valueB);
}

/**
 * Resolve params for a pass node, substituting values from any connected
 * ColorNode, ValueNode, or RampNode suppliers.
 */
function resolveParams(
  node: Node,
  currentNodes: Node[],
  currentEdges: Edge[]
): Record<string, any> {
  const baseParams: Record<string, any> =
    node.type === "gradientMap"
      ? { color1: node.data.color1, color2: node.data.color2 }
      : node.type === "colorLookup"
      ? {
          lutDataUrl: node.data.lutDataUrl ?? null,
          lutFileName: node.data.lutFileName ?? null,
          strength: node.data.strength ?? 1.0,
          flipY: node.data.flipY ?? false,
        }
      : { ...(node.data.params || {}) };

  const incomingEdges = currentEdges.filter((e) => e.target === node.id);

  for (const edge of incomingEdges) {
    const sourceNode = currentNodes.find((n) => n.id === edge.source);
    if (!sourceNode) continue;

    const paramKey = edge.targetHandle?.replace("-in", "");
    if (!paramKey) continue;

    if (sourceNode.type === "colorNode" && typeof sourceNode.data.color === "string") {
      baseParams[paramKey] = sourceNode.data.color;
    }

    if (sourceNode.type === "valueNode" && typeof sourceNode.data.value === "number") {
      baseParams[paramKey] = sourceNode.data.value;
    }

    if (sourceNode.type === "rampNode") {
      baseParams[paramKey] = resolveRampValue(sourceNode, currentNodes, currentEdges);
    }
  }

  return baseParams;
}

export function usePipelineExport({ onChange }: UsePipelineExportArgs): PipelineExport {
  const notifyChange = useCallback(
    (currentNodes: Node[], currentEdges: Edge[]) => {
      if (!onChange) return;

      const targetIds = new Set(currentEdges.map((e) => e.target));
      const head = currentNodes.find(
        (n) => n.id === "start" || !targetIds.has(n.id)
      );

      const passes: PassConfig[] = [];
      let current = head;

      while (current) {
        if (
          current.type === "shaderPass" ||
          current.type === "gradientMap" ||
          current.type === "colorLookup"
        ) {
          const resolvedParams = resolveParams(current, currentNodes, currentEdges);
          passes.push({
            id: current.id,
            type:
              current.type === "gradientMap"
                ? "gradientMap"
                : current.type === "colorLookup"
                ? "colorLookup"
                : (current.data.label as any),
            params: resolvedParams,
          });
        }

        // Step to next node in the image pipeline (ignore value/color supplier edges)
        const edge = currentEdges.find(
          (e) =>
            e.source === current!.id &&
            (!e.sourceHandle || e.sourceHandle === "source")
        );
        if (edge) {
          current = currentNodes.find((n) => n.id === edge.target);
        } else {
          current = undefined;
        }
      }

      onChange({ passes });
    },
    [onChange]
  );

  return { resolveRampValue, resolveParams, notifyChange };
}
