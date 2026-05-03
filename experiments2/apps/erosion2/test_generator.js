import MountainRangeGenerator from './src/MountainRangeGenerator.js';

const generator = new MountainRangeGenerator();
const root = generator.generateTree(4, 3);

function printTree(node, depth = 0) {
    const indent = '  '.repeat(depth);
    console.log(`${indent}Node at (${node.x.toFixed(2)}, ${node.y.toFixed(2)}) - Children: ${node.children.length}`);
    node.children.forEach(child => printTree(child, depth + 1));
}

console.log('Generated Tree Structure:');
printTree(root);
