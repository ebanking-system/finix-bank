import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      // /users/** → API Gateway (auth endpoints: signin, signup, password-encryption)
      '/users': {
        target: 'http://localhost:9090',
        changeOrigin: true,
      },
      // /api/** → API Gateway (all other microservice routes)
      '/api': {
        target: 'http://localhost:9090',
        changeOrigin: true,
      },
    },
  },
});
