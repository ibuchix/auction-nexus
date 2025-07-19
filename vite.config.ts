
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",  // Keep existing network exposure for development
    port: 8080,
    fs: {
      // Explicitly deny sensitive files and directories for additional security
      deny: [
        '.env*',
        '*.{crt,pem,key}',
        '**/.git/**',
        '**/node_modules/.cache/**',
        '**/supabase/.env*',
        '**/*.log',
        '**/package-lock.json',
        '**/yarn.lock',
        '**/pnpm-lock.yaml'
      ]
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
