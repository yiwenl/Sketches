import { Node } from "@xyflow/react";
import { NodeMutations } from "./useNodeMutations";

interface UseNodeFactoryArgs {
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  mutations: NodeMutations;
}

export interface NodeFactory {
  addPassNode: (type: string, defaultParams: any, pos?: { x: number; y: number }) => void;
  addGradientMapNode: (pos?: { x: number; y: number }) => void;
  addColorLookupNode: (pos?: { x: number; y: number }) => void;
  addColorNode: (pos?: { x: number; y: number }) => void;
  addValueNode: (pos?: { x: number; y: number }) => void;
  addRampNode: (pos?: { x: number; y: number }) => void;
}

export function useNodeFactory({ setNodes, mutations }: UseNodeFactoryArgs): NodeFactory {
  const {
    handleParamChange,
    handleColorNodeChange,
    handleValueNodeChange,
    handleRampNodeChange,
  } = mutations;

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
    setNodes((nds) => [...nds, newNode]);
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
    setNodes((nds) => [...nds, newNode]);
  };

  const addColorLookupNode = (pos?: { x: number; y: number }) => {
    const id = `colorLookup-${Date.now()}`;
    const newNode: Node = {
      id,
      type: "colorLookup",
      position: pos ?? { x: 50, y: 50 },
      data: {
        lutDataUrl: null,
        lutFileName: null,
        strength: 1.0,
        flipY: false,
        onParamChange: (key: string, val: any) => handleParamChange(id, key, val),
      },
    };
    setNodes((nds) => [...nds, newNode]);
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
    setNodes((nds) => [...nds, newNode]);
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
    setNodes((nds) => [...nds, newNode]);
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

  return {
    addPassNode,
    addGradientMapNode,
    addColorLookupNode,
    addColorNode,
    addValueNode,
    addRampNode,
  };
}
