import { Node } from './src/Node.js';

const root = new Node(0, 0);
const child1 = new Node(10, 10);
const child2 = new Node(20, 20);

root.addChild(child1);
root.addChild(child2);

console.log('Root children count:', root.children.length);
console.log('Child 1 position:', child1.x, child1.y);

root.removeChild(child1);
console.log('Root children count after removal:', root.children.length);
