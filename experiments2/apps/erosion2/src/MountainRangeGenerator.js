import { Node } from "./Node.js";
import { vec2 } from "gl-matrix";
import Constants from "./Constants.js";

export const SIMULATION_STEPS = 100;

export default class MountainRangeGenerator {
  constructor() {
    this.root = null;
  }

  generateTree() {
    this.root = new Node([0, 0]); // Root at 0,0, level 0

    this.root.spawn();

    const nodes = this.getAllNodes();
    const { MAP_SIZE } = Constants;

    let maxWidth = 0;
    let maxHeight = 0;
    nodes.forEach((node) => {
      maxWidth = Math.max(maxWidth, node.x);
      maxHeight = Math.max(maxHeight, node.y);
    });

    const scale = (MAP_SIZE * 2.0) / Math.max(maxWidth, maxHeight);
    nodes.forEach((node) => {
      vec2.scale(node.position, node.position, scale);
      vec2.add(node.position, node.position, [-MAP_SIZE, 0]);
    });

    this.step = 0;
    this.simulate();

    window.addEventListener("keydown", (e) => {
      if (e.key === "s" && !e.metaKey) {
        this.simulate();
      }
    });

    return this.root;
  }

  simulate() {
    const minDist = 1.0;
    const speed = 0.01;
    const nodes = this.getAllNodes();

    nodes.forEach((nA) => {
      nodes.forEach((nB) => {
        if (nA !== nB) {
          const distance = vec2.distance(nA.position, nB.position);
          const dir = vec2.sub([0, 0], nB.position, nA.position);
          vec2.scale(dir, dir, speed);

          if (distance < minDist) {
            vec2.sub(nA.position, vec2.clone(nA.position), dir);
            vec2.add(nB.position, vec2.clone(nB.position), dir);
          }
        }
      });
    });

    if (this.step++ < SIMULATION_STEPS) {
      requestAnimationFrame(() => this.simulate());
    }
  }

  getAllNodes() {
    const nodes = [];
    const traverse = (node) => {
      nodes.push(node);
      node.children.forEach(traverse);
    };
    if (this.root) {
      traverse(this.root);
    }
    return nodes;
  }

  /**
   * Traverses the tree and calls the callback for each parent-child pair
   * @param {Function} callback - Function called with (parent, child) for each edge
   */
  traverse(callback) {
    if (!this.root) return;

    const traverseNode = (node) => {
      node.children.forEach((child) => {
        callback(node, child);
        traverseNode(child);
      });
    };

    traverseNode(this.root);
  }

  get hasSimulationDone() {
    return this.step > SIMULATION_STEPS;
  }
}
