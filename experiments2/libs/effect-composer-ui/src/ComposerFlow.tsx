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
import { PipelineConfig, PassConfig } from "./types";
import { ShaderPassNode } from "./nodes/ShaderPassNode";
import { StartNode } from "./nodes/StartNode";
import { EndNode } from "./nodes/EndNode";
import { GradientMapNode } from "./nodes/GradientMapNode";
import { ColorNode } from "./nodes/ColorNode";
import { ValueNode } from "./nodes/ValueNode";
import { RampNode } from "./nodes/RampNode";
import { rampMix } from "./utils/bezierSample";
import { NodePickerMenu, CatalogEntry } from "./NodePickerMenu";
import { NodePanel } from "./NodePanel";

const nodeTypes = {
  shaderPass: ShaderPassNode,
  gradientMap: GradientMapNode,
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

  // Sync internal state to parent pipeline config automatically
  useEffect(() => {
    if (nodes.length > 0) {
      notifyChange(nodes, edges);
    }
  }, [nodes, edges]);

  // Convert linear PipelineConfig to React Flow nodes/edges
  useEffect(() => {
    if (initialGraph) {
      const restoredNodes = initialGraph.nodes.map((n: any) => {
        if (n.type === "shaderPass") {
          return {
            ...n,
            data: {
              ...n.data,
              onParamChange: (key: string, val: any) =>
                handleParamChange(n.id, key, val),
            },
          };
        }
        if (n.type === "gradientMap") {
          return {
            ...n,
            data: {
              ...n.data,
              onParamChange: (key: string, val: any) =>
                handleParamChange(n.id, key, val),
            },
          };
        }
        if (n.type === "colorNode") {
          return {
            ...n,
            data: {
              ...n.data,
              onColorChange: (color: string) =>
                handleColorNodeChange(n.id, color),
            },
          };
        }
        if (n.type === "valueNode") {
          return {
            ...n,
            data: {
              ...n.data,
              onValueChange: (value: number) =>
                handleValueNodeChange(n.id, value),
            },
          };
        }
        if (n.type === "rampNode") {
          return {
            ...n,
            data: {
              ...n.data,
              onStopsChange: (stops: any[]) =>
                handleRampNodeChange(n.id, "stops", stops),
            },
          };
        }
        return n;
      });
      setNodes(restoredNodes);
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
                handleParamChange(pass.id, key, val),
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
              handleParamChange(pass.id, key, val),
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

  // Keep a ref so setNodes callbacks can always read the latest edges.
  const edgesRef = useRef<Edge[]>([]);
  edgesRef.current = edges;

  const rfInstanceRef = useRef<ReactFlowInstance | null>(null);

  const [menuState, setMenuState] = useState<{
    open: boolean;
    screenPos: { x: number; y: number };
    flowPos: { x: number; y: number };
  }>({ open: false, screenPos: { x: 0, y: 0 }, flowPos: { x: 0, y: 0 } });

  const closeMenu = useCallback(() => {
    setMenuState((s) => ({ ...s, open: false }));
  }, []);

  /**
   * Propagates ColorNode values into the display data of connected nodes
   * (e.g. GradientMapNode color1/color2) so the UI stays in sync with wired
   * connections. This is distinct from resolveParams, which only affects the
   * exported PipelineConfig.
   */
  const syncDisplayData = useCallback(
    (currentNodes: Node[], currentEdges: Edge[]): Node[] => {
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
    },
    []
  );

  /**
   * Compute the output value of a rampNode, resolving any ValueNode inputs
   * wired into its a-in, b-in, or position-in handles.
   */
  const resolveRampValue = useCallback(
    (ramp: Node, currentNodes: Node[], currentEdges: Edge[]): number => {
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
    },
    []
  );

  /**
   * Resolve params for a pass node, substituting values from any connected
   * ColorNode, ValueNode, or RampNode suppliers.
   */
  const resolveParams = useCallback(
    (node: Node, currentNodes: Node[], currentEdges: Edge[]) => {
      const baseParams: Record<string, any> =
        node.type === "gradientMap"
          ? { color1: node.data.color1, color2: node.data.color2 }
          : { ...(node.data.params || {}) };

      // Find all edges that target this node
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
    },
    [resolveRampValue]
  );

  // Sync internal state to parent pipeline config
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
          current.type === "gradientMap"
        ) {
          const resolvedParams = resolveParams(
            current,
            currentNodes,
            currentEdges
          );
          passes.push({
            id: current.id,
            type:
              current.type === "gradientMap"
                ? "gradientMap"
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
    [onChange, resolveParams]
  );

  const handleParamChange = useCallback(
    (id: string, key: string, val: any) => {
      setNodes((nds) => {
        const updated = nds.map((n) => {
          if (n.id === id) {
            if (n.type === "gradientMap") {
              return { ...n, data: { ...n.data, [key]: val } };
            }
            return {
              ...n,
              data: {
                ...n.data,
                params: { ...(n.data.params || {}), [key]: val },
              },
            };
          }
          return n;
        });
        return updated;
      });
    },
    []
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
    [syncDisplayData]
  );

  const handleValueNodeChange = useCallback(
    (id: string, value: number) => {
      setNodes((nds) => {
        return nds.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, value } } : n
        );
      });
    },
    []
  );

  const handleRampNodeChange = useCallback(
    (id: string, key: string, val: any) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, [key]: val } } : n
        )
      );
    },
    []
  );

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => {
        return applyNodeChanges(changes, nds);
      });
    },
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => {
        const next = applyEdgeChanges(changes, eds);
        edgesRef.current = next;
        setNodes((nds) => syncDisplayData(nds, next));
        return next;
      });
    },
    [syncDisplayData]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => {
        // Output node only accepts a single input — drop any existing connection to it.
        const filtered =
          params.target === "end"
            ? eds.filter((e) => e.target !== "end")
            : eds;
        const next = addEdge(params, filtered);
        edgesRef.current = next;
        setNodes((nds) => syncDisplayData(nds, next));
        return next;
      });
    },
    [syncDisplayData]
  );

  const addPassNode = (
    type: string,
    defaultParams: any,
    pos?: { x: number; y: number }
  ) => {
    const id = `${type}-${Date.now()}`;
    const newNode: Node = {
      id,
      type: "shaderPass",
      position: pos ?? { x: 50, y: 50 },
      data: {
        label: type,
        params: defaultParams,
        onParamChange: (key: string, val: any) => handleParamChange(id, key, val),
      },
    };
    setNodes((nds) => {
      return [...nds, newNode];
    });
  };

  const addGradientMapNode = (pos?: { x: number; y: number }) => {
    const id = `gradientMap-${Date.now()}`;
    const newNode: Node = {
      id,
      type: "gradientMap",
      position: pos ?? { x: 50, y: 50 },
      data: {
        color1: "#000000",
        color2: "#ffffff",
        onParamChange: (key: string, val: any) => handleParamChange(id, key, val),
      },
    };
    setNodes((nds) => {
      return [...nds, newNode];
    });
  };

  const addColorNode = (pos?: { x: number; y: number }) => {
    const id = `colorNode-${Date.now()}`;
    const newNode: Node = {
      id,
      type: "colorNode",
      position: pos ?? { x: 50, y: 300 },
      data: {
        color: "#aee6ff",
        onColorChange: (color: string) => handleColorNodeChange(id, color),
      },
    };
    setNodes((nds) => {
      return [...nds, newNode];
    });
  };

  const addValueNode = (pos?: { x: number; y: number }) => {
    const id = `valueNode-${Date.now()}`;
    const newNode: Node = {
      id,
      type: "valueNode",
      position: pos ?? { x: 50, y: 400 },
      data: {
        label: "Value",
        value: 0.5,
        min: 0,
        max: 1,
        step: 0.01,
        onValueChange: (value: number) => handleValueNodeChange(id, value),
      },
    };
    setNodes((nds) => {
      return [...nds, newNode];
    });
  };

  const addRampNode = (pos?: { x: number; y: number }) => {
    const id = `rampNode-${Date.now()}`;
    const newNode: Node = {
      id,
      type: "rampNode",
      position: pos ?? { x: 50, y: 500 },
      data: {
        valueA: 0,
        valueB: 1,
        position: 0.5,
        curve: [0.33, 0.33, 0.66, 0.66] as [number, number, number, number],
        onDataChange: (key: string, val: any) => handleRampNodeChange(id, key, val),
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const nodeCatalog = useMemo<CatalogEntry[]>(
    () => [
      {
        group: "Nodes",
        label: "Curve",
        onAdd: () =>
          addPassNode("curve", { curve: [0.33, 0.33, 0.66, 0.66] }, menuState.flowPos),
      },
      {
        group: "Nodes",
        label: "FXAA",
        onAdd: () =>
          addPassNode("fxaa", { resolution: [1920, 1080] }, menuState.flowPos),
      },
      {
        group: "Nodes",
        label: "Vignette",
        onAdd: () =>
          addPassNode("vignette", { radius: 0.75, strength: 0.4 }, menuState.flowPos),
      },
      {
        group: "Nodes",
        label: "Contrast/Brightness",
        onAdd: () =>
          addPassNode(
            "contrastBrightness",
            { contrast: 1.0, brightness: 1.0 },
            menuState.flowPos
          ),
      },
      {
        group: "Nodes",
        label: "Hue/Saturation",
        onAdd: () =>
          addPassNode("hueSaturation", { hue: 0, saturation: 1.0 }, menuState.flowPos),
      },
      {
        group: "Nodes",
        label: "Gradient Map",
        onAdd: () => addGradientMapNode(menuState.flowPos),
      },
      { group: "Values", label: "Color", onAdd: () => addColorNode(menuState.flowPos) },
      { group: "Values", label: "Value", onAdd: () => addValueNode(menuState.flowPos) },
      { group: "Values", label: "Ramp", onAdd: () => addRampNode(menuState.flowPos) },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [menuState.flowPos]
  );

  // Catalog for the side panel — nodes appear at default positions (no right-click pos)
  const panelCatalog = useMemo<CatalogEntry[]>(
    () => [
      {
        group: "Nodes",
        label: "Curve",
        onAdd: () => addPassNode("curve", { curve: [0.33, 0.33, 0.66, 0.66] }),
      },
      {
        group: "Nodes",
        label: "FXAA",
        onAdd: () => addPassNode("fxaa", { resolution: [1920, 1080] }),
      },
      {
        group: "Nodes",
        label: "Vignette",
        onAdd: () => addPassNode("vignette", { radius: 0.75, strength: 0.4 }),
      },
      {
        group: "Nodes",
        label: "Contrast/Brightness",
        onAdd: () =>
          addPassNode("contrastBrightness", { contrast: 1.0, brightness: 1.0 }),
      },
      {
        group: "Nodes",
        label: "Hue/Saturation",
        onAdd: () => addPassNode("hueSaturation", { hue: 0, saturation: 1.0 }),
      },
      { group: "Nodes", label: "Gradient Map", onAdd: () => addGradientMapNode() },
      { group: "Values", label: "Color", onAdd: () => addColorNode() },
      { group: "Values", label: "Value", onAdd: () => addValueNode() },
      { group: "Values", label: "Ramp", onAdd: () => addRampNode() },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
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

  const handleExport = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify({ nodes, edges }));
    const dlAnchorElem = document.createElement("a");
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "effect_composer_pipeline.json");
    dlAnchorElem.click();
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.nodes && json.edges) {
          const restoredNodes = json.nodes.map((n: any) => {
            if (n.type === "shaderPass") {
              return {
                ...n,
                data: {
                  ...n.data,
                  onParamChange: (key: string, val: any) =>
                    handleParamChange(n.id, key, val),
                },
              };
            }
            if (n.type === "gradientMap") {
              return {
                ...n,
                data: {
                  ...n.data,
                  onParamChange: (key: string, val: any) =>
                    handleParamChange(n.id, key, val),
                },
              };
            }
            if (n.type === "colorNode") {
              return {
                ...n,
                data: {
                  ...n.data,
                  onColorChange: (color: string) =>
                    handleColorNodeChange(n.id, color),
                },
              };
            }
            if (n.type === "valueNode") {
              return {
                ...n,
                data: {
                  ...n.data,
                  onValueChange: (value: number) =>
                    handleValueNodeChange(n.id, value),
                },
              };
            }
            if (n.type === "rampNode") {
              return {
                ...n,
                data: {
                  ...n.data,
                  onDataChange: (key: string, val: any) =>
                    handleRampNodeChange(n.id, key, val),
                },
              };
            }
            return n;
          });

          if (!restoredNodes.find((n: any) => n.id === "start")) {
            restoredNodes.unshift({
              id: "start",
              type: "start",
              position: { x: 50, y: 150 },
              data: {},
            });
          }
          if (!restoredNodes.find((n: any) => n.id === "end")) {
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

      <input type="file" ref={fileInputRef} style={{ display: "none" }} accept=".json" onChange={handleImport} />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 1.2 }}
        onInit={(instance) => { rfInstanceRef.current = instance; }}
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
