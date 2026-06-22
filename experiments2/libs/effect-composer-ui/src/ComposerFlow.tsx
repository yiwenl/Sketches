import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import {
  ReactFlow,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
  ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "./theme.css";
import { PipelineConfig } from "./types";
import { ShaderPassNode } from "./nodes/ShaderPassNode";
import { StartNode } from "./nodes/StartNode";
import { EndNode } from "./nodes/EndNode";
import { GradientMapNode } from "./nodes/GradientMapNode";
import { ColorLookupNode } from "./nodes/ColorLookupNode";
import { ColorNode } from "./nodes/ColorNode";
import { ValueNode } from "./nodes/ValueNode";
import { RampNode } from "./nodes/RampNode";
import { NodePickerMenu, CatalogEntry } from "./NodePickerMenu";
import { NodePanel } from "./NodePanel";
import { useNodeMutations } from "./hooks/useNodeMutations";
import { usePipelineExport } from "./hooks/usePipelineExport";
import { useNodeFactory } from "./hooks/useNodeFactory";
import { useGraphIO } from "./hooks/useGraphIO";
import { restoreNodeCallbacks } from "./utils/restoreNodeCallbacks";
import { NODE_CATALOG_DEFS } from "./utils/nodeCatalogDefs";

const nodeTypes = {
  shaderPass: ShaderPassNode,
  gradientMap: GradientMapNode,
  colorLookup: ColorLookupNode,
  colorNode: ColorNode,
  valueNode: ValueNode,
  rampNode: RampNode,
  start: StartNode,
  end: EndNode,
};

interface ComposerFlowProps {
  initialConfig?: PipelineConfig;
  initialGraph?: { nodes: Node[]; edges: Edge[] };
  onChange?: (config: PipelineConfig) => void;
  onClose?: () => void;
}

export function ComposerFlow({
  initialConfig,
  initialGraph,
  onChange,
  onClose,
}: ComposerFlowProps) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const edgesRef = useRef<Edge[]>([]);
  edgesRef.current = edges;
  const rfInstanceRef = useRef<ReactFlowInstance | null>(null);

  const [menuState, setMenuState] = useState<{
    open: boolean;
    screenPos: { x: number; y: number };
    flowPos: { x: number; y: number };
  }>({ open: false, screenPos: { x: 0, y: 0 }, flowPos: { x: 0, y: 0 } });

  // --- Hooks ---
  const mutations = useNodeMutations({ setNodes, edgesRef });
  const { notifyChange } = usePipelineExport({ onChange });
  const factory = useNodeFactory({ setNodes, mutations });
  const { fileInputRef, handleExport, handleImport } = useGraphIO({
    nodes,
    edges,
    setNodes,
    setEdges,
    mutations,
  });

  // Sync internal state to parent pipeline config automatically
  useEffect(() => {
    if (nodes.length > 0) {
      notifyChange(nodes, edges);
    }
  }, [nodes, edges]);

  // Initialise from a saved graph (nodes + edges)
  useEffect(() => {
    if (initialGraph) {
      setNodes(restoreNodeCallbacks(initialGraph.nodes, mutations));
      setEdges(initialGraph.edges);
      return;
    }

    if (!initialConfig) return;

    const NODE_SPACING = 320;
    const NODE_Y = 200;

    const initialNodes: Node[] = [
      { id: "start", type: "start", position: { x: 0, y: NODE_Y }, data: {} },
      ...initialConfig.passes.map((pass, i) => {
        const position = { x: NODE_SPACING * (i + 1), y: NODE_Y };
        if (pass.type === "gradientMap") {
          return {
            id: pass.id,
            type: "gradientMap",
            position,
            data: {
              color1: pass.params.color1 ?? "#000000",
              color2: pass.params.color2 ?? "#ffffff",
              onParamChange: (key: string, val: any) =>
                mutations.handleParamChange(pass.id, key, val),
            },
          };
        }
        if (pass.type === "colorLookup") {
          return {
            id: pass.id,
            type: "colorLookup",
            position,
            data: {
              lutDataUrl: pass.params.lutDataUrl ?? null,
              lutFileName: pass.params.lutFileName ?? null,
              strength: pass.params.strength ?? 1.0,
              onParamChange: (key: string, val: any) =>
                mutations.handleParamChange(pass.id, key, val),
            },
          };
        }
        return {
          id: pass.id,
          type: "shaderPass",
          position,
          data: {
            label: pass.type,
            params: { ...pass.params },
            onParamChange: (key: string, val: any) =>
              mutations.handleParamChange(pass.id, key, val),
          },
        };
      }),
      {
        id: "end",
        type: "end",
        position: {
          x: NODE_SPACING * (initialConfig.passes.length + 1),
          y: NODE_Y,
        },
        data: {},
      },
    ];

    const initialEdges: Edge[] = [];
    if (initialConfig.passes.length > 0) {
      initialEdges.push({
        id: `e-start-${initialConfig.passes[0].id}`,
        source: "start",
        target: initialConfig.passes[0].id,
      });
      for (let i = 0; i < initialConfig.passes.length - 1; i++) {
        initialEdges.push({
          id: `e${initialConfig.passes[i].id}-${initialConfig.passes[i + 1].id}`,
          source: initialConfig.passes[i].id,
          target: initialConfig.passes[i + 1].id,
        });
      }
      initialEdges.push({
        id: `e-${initialConfig.passes[initialConfig.passes.length - 1].id}-end`,
        source: initialConfig.passes[initialConfig.passes.length - 1].id,
        target: "end",
      });
    } else {
      initialEdges.push({ id: `e-start-end`, source: "start", target: "end" });
    }

    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialConfig]);

  // --- Flow event handlers ---
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => {
        const next = applyEdgeChanges(changes, eds);
        edgesRef.current = next;
        setNodes((nds) => mutations.syncDisplayData(nds, next));
        return next;
      });
    },
    [mutations]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => {
        const filtered = eds.filter(
          (e) =>
            !(
              e.target === params.target &&
              (e.targetHandle ?? null) === (params.targetHandle ?? null)
            )
        );
        const next = addEdge(params, filtered);
        edgesRef.current = next;
        setNodes((nds) => mutations.syncDisplayData(nds, next));
        return next;
      });
    },
    [mutations]
  );

  const handlePaneContextMenu = useCallback(
    (e: MouseEvent | React.MouseEvent<Element>) => {
      e.preventDefault();
      const screenPos = { x: e.clientX, y: e.clientY };
      const flowPos = rfInstanceRef.current
        ? rfInstanceRef.current.screenToFlowPosition(screenPos)
        : screenPos;
      setMenuState({ open: true, screenPos, flowPos });
    },
    []
  );

  const closeMenu = useCallback(() => {
    setMenuState((s) => ({ ...s, open: false }));
  }, []);

  // --- Catalogs (derived from single definition) ---
  const nodeCatalog = useMemo<CatalogEntry[]>(
    () =>
      NODE_CATALOG_DEFS.map((def) => ({
        group: def.group,
        label: def.label,
        onAdd: () => {
          const pos = menuState.flowPos;
          if (def.nodeKind === "shaderPass") {
            factory.addPassNode(def.passType!, def.defaultParams, pos);
          } else if (def.nodeKind === "gradientMap") {
            factory.addGradientMapNode(pos);
          } else if (def.nodeKind === "colorLookup") {
            factory.addColorLookupNode(pos);
          } else if (def.nodeKind === "colorNode") {
            factory.addColorNode(pos);
          } else if (def.nodeKind === "valueNode") {
            factory.addValueNode(pos);
          } else if (def.nodeKind === "rampNode") {
            factory.addRampNode(pos);
          }
        },
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [menuState.flowPos]
  );

  const panelCatalog = useMemo<CatalogEntry[]>(
    () =>
      NODE_CATALOG_DEFS.map((def) => ({
        group: def.group,
        label: def.label,
        onAdd: () => {
          if (def.nodeKind === "shaderPass") {
            factory.addPassNode(def.passType!, def.defaultParams);
          } else if (def.nodeKind === "gradientMap") {
            factory.addGradientMapNode();
          } else if (def.nodeKind === "colorLookup") {
            factory.addColorLookupNode();
          } else if (def.nodeKind === "colorNode") {
            factory.addColorNode();
          } else if (def.nodeKind === "valueNode") {
            factory.addValueNode();
          } else if (def.nodeKind === "rampNode") {
            factory.addRampNode();
          }
        },
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <div
      className="composer-ui-root"
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        background: "transparent",
      }}
    >
      <NodePanel
        catalog={panelCatalog}
        onExport={handleExport}
        onImport={() => fileInputRef.current?.click()}
        onClose={onClose}
      />

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept=".json"
        onChange={handleImport}
      />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 1.2 }}
        onInit={(instance) => {
          rfInstanceRef.current = instance;
        }}
        onPaneContextMenu={handlePaneContextMenu}
      >
        <Background />
      </ReactFlow>

      {menuState.open && (
        <NodePickerMenu
          screenPos={menuState.screenPos}
          catalog={nodeCatalog}
          onClose={closeMenu}
        />
      )}
    </div>
  );
}
