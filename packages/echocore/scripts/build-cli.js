#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Function to copy compiled files from src to dist
function copyCompiledFiles(srcDir, distDir) {
  // Ensure the dist directory exists
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // Get all files and directories in the source directory
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });

  // Process each entry
  entries.forEach((entry) => {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(distDir, entry.name);

    if (entry.isDirectory()) {
      // Recursively copy subdirectories
      copyCompiledFiles(srcPath, destPath);
    } else if (
      entry.name.endsWith('.js') ||
      entry.name.endsWith('.js.map') ||
      entry.name.endsWith('.d.ts')
    ) {
      // Copy compiled files
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied ${srcPath} to ${destPath}`);
    }
  });
}

// Copy all compiled files from src to dist
const srcDir = path.join(__dirname, '..', 'src');
const distDir = path.join(__dirname, '..', 'dist');

// Copy core, agents, and cli directories
const directories = ['core', 'agents', 'cli', 'examples'];
directories.forEach((dir) => {
  const srcSubDir = path.join(srcDir, dir);
  const distSubDir = path.join(distDir, dir);
  if (fs.existsSync(srcSubDir)) {
    copyCompiledFiles(srcSubDir, distSubDir);
  }
});

console.log('Build completed!');
