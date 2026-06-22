import { useRef } from "react";
import { Node, Edge } from "@xyflow/react";
import { NodeMutations } from "./useNodeMutations";
import { restoreNodeCallbacks } from "../utils/restoreNodeCallbacks";

interface UseGraphIOArgs {
  nodes: Node[];
  edges: Edge[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  mutations: NodeMutations;
}

export interface GraphIO {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleExport: () => void;
  handleImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function useGraphIO({
  nodes,
  edges,
  setNodes,
  setEdges,
  mutations,
}: UseGraphIOArgs): GraphIO {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const nodesWithoutDataUrls = nodes.map(n => {
      if (n.type === 'colorLookup') {
        const { lutDataUrl, ...restData } = n.data;
        return { ...n, data: restData };
      }
      return n;
    });

    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify({ nodes: nodesWithoutDataUrls, edges }));
    const dlAnchorElem = document.createElement("a");
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "effect_composer_pipeline.json");
    dlAnchorElem.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.nodes && json.edges) {
          const restoredNodes = restoreNodeCallbacks(json.nodes, mutations);

          if (!restoredNodes.find((n) => n.id === "start")) {
            restoredNodes.unshift({
              id: "start",
              type: "start",
              position: { x: 50, y: 150 },
              data: {},
            });
          }
          if (!restoredNodes.find((n) => n.id === "end")) {
            restoredNodes.push({
              id: "end",
              type: "end",
              position: { x: 1000, y: 150 },
              data: {},
            });
          }

          setNodes(restoredNodes);
          setEdges(json.edges);
        }
      } catch (err) {
        console.error("Failed to parse JSON pipeline", err);
      }
    };
    reader.readAsText(file);
  };

  return { fileInputRef, handleExport, handleImport };
}
