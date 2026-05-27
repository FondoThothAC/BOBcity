import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    port: 3335,
    // Escuchar en todas las interfaces de red para permitir acceso local/remoto
    host: '0.0.0.0'
  }
});
