#!/usr/bin/env node
/**
 * Find an available port and start Vite. Works around Vite's port detection
 * issues with host: true + HTTPS (see https://github.com/vitejs/vite/issues/3391)
 */
import { createServer } from 'node:net';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

function findAvailablePort(startPort = 5173) {
  return new Promise((resolve) => {
    const server = createServer();
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        server.close();
        findAvailablePort(startPort + 1).then(resolve);
      } else {
        server.close();
        resolve(startPort); // Fallback on other errors
      }
    });
    server.once('listening', () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
    server.listen(startPort, '0.0.0.0');
  });
}

const port = await findAvailablePort(5173);
spawn('vite', ['--host', '--port', String(port)], {
  stdio: 'inherit',
  shell: true,
  cwd: projectRoot,
});
