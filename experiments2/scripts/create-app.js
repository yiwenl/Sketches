#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createApp(appName) {
  if (!appName) {
    console.error('Usage: node create-app.js <app-name>');
    console.error('Example: node create-app.js my-new-app');
    process.exit(1);
  }

  // Validate app name
  if (!/^[a-z0-9-]+$/.test(appName)) {
    console.error('App name must contain only lowercase letters, numbers, and hyphens');
    process.exit(1);
  }

  const templateDir = path.join(__dirname, '..', 'apps', '_template');
  const targetDir = path.join(__dirname, '..', 'apps', appName);

  // Check if template exists
  if (!fs.existsSync(templateDir)) {
    console.error('Template directory not found:', templateDir);
    process.exit(1);
  }

  // Check if target already exists
  if (fs.existsSync(targetDir)) {
    console.error(`App "${appName}" already exists at:`, targetDir);
    process.exit(1);
  }

  try {
    // Copy template directory
    copyDirectory(templateDir, targetDir);
    
    // Update package.json
    const packageJsonPath = path.join(targetDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      packageJson.name = `@experiments2/${appName}`;
      packageJson.description = `${appName} application`;
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    }

    console.log(`✅ Successfully created app "${appName}" at: ${targetDir}`);
    console.log(`📁 You can now run: cd apps/${appName} && pnpm install && pnpm dev`);
    
  } catch (error) {
    console.error('Error creating app:', error.message);
    process.exit(1);
  }
}

function copyDirectory(src, dest) {
  // Create destination directory
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // Read source directory
  const items = fs.readdirSync(src);

  for (const item of items) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      // Recursively copy directories
      copyDirectory(srcPath, destPath);
    } else {
      // Copy files
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Get app name from command line arguments
const appName = process.argv[2];
createApp(appName); 