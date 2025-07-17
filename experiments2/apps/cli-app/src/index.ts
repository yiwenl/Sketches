#!/usr/bin/env node

import { random, pick } from "@experiments2/utils";
import * as glMatrix from "gl-matrix";
import requestIdleCallback from "scheduling";

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log("No arguments provided");
  console.log("Usage: cli-app <number>");
  process.exit(1);
}

const number = parseInt(args[0]);
if (isNaN(number)) {
  console.log("Please provide a valid number");
  process.exit(1);
}

const randomValue = random(1, number);
const items = ["apple", "banana", "cherry", "date"];
const pickedItem = pick(items);

console.log(`Random number between 1 and ${number}: ${randomValue}`);
console.log(`Randomly picked item: ${pickedItem}`);
