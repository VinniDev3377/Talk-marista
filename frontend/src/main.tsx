/** MÓDULO: Inicializa o React, fornece o contexto de autenticação e registra o cache offline. */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./cloud";

/** Ponto de entrada: fornece o login (Supabase) ao aplicativo inteiro. */
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider><App /></AuthProvider>
  </StrictMode>,
);

// Registra o cache do app em produção para permitir a reabertura sem rede.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.warn("Não foi possível ativar o modo offline:", error);
    });
  });
}
