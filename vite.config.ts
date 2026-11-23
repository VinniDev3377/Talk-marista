import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Mantém o código da interface isolado em frontend/ e publica o build na raiz dist/.
export default defineConfig({
  root: "frontend",
  publicDir: "public",
  plugins: [react()],
  server: { host: true },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
});
