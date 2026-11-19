import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// `host: true` deixa o servidor acessível pelo iPhone na mesma rede Wi-Fi.
// Vite: ativa a transformação JSX do React e permite acesso pela rede local durante testes.
export default defineConfig({
  plugins: [react()],
  server: { host: true },
});
