import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  plugins: [
    basicSsl()
  ],
  server: {
    // Port is set by scripts/dev.mjs to find next available (works around
    // Vite port detection issues with host: true + HTTPS)
    strictPort: true, // We pre-resolve the port, so require it
    https: true,
    host: true, // This allows network access alongside HTTPS
  }
});
