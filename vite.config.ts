import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  optimizeDeps: { exclude: ['lucide-react'], },
  base: mode === 'production'
    ? '/itamar_virtual_museum_demo1950_v1.0/'
    : '',
}));

