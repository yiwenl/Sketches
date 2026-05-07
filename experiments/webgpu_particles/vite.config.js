import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

// Only apply the GitHub Pages subpath at build time so local dev stays at "/".
export default defineConfig(({ command }) => ({
  base:
    command === 'build'
      ? '/Sketches/experiments/webgpu_particles/dist/'
      : '/',
  plugins: [basicSsl()],
  server: {
    // Port is set by scripts/dev.mjs to find next available (works around
    // Vite port detection issues with host: true + HTTPS)
    strictPort: true, // We pre-resolve the port, so require it
    https: true,
    host: true, // This allows network access alongside HTTPS
  },
}));
