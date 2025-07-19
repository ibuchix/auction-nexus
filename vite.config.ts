
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",  // Keep existing network exposure for development
    port: 8080,
    cors: {
      // Restrict CORS to localhost and known development domains for additional security
      origin: [
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        /^http:\/\/192\.168\.\d+\.\d+:8080$/,
        /^http:\/\/10\.\d+\.\d+\.\d+:8080$/,
        /^http:\/\/172\.(1[6-9]|2\d|3[01])\.\d+\.\d+:8080$/
      ],
      credentials: true
    },
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
