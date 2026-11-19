/** MÓDULO: Cria o cliente opcional do Supabase a partir das variáveis de ambiente. */
/**
 * Cliente Supabase (conexão com a nuvem).
 *
 * Para ativar a nuvem, crie um arquivo `.env.local` na raiz do projeto com:
 *   VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
 *   VITE_SUPABASE_ANON_KEY=sua-chave-publica
 *
 * Sem essas variáveis o aplicativo roda em modo demonstração (dados no aparelho).
 */
import { createClient } from "@supabase/supabase-js";

declare global {
  interface Window {
    TALK_MARISTA_SUPABASE_CONFIG?: { url?: string; publishableKey?: string };
  }
}

// Aceita tanto variáveis de ambiente Vite quanto a configuração pública usada
// pelo pacote anterior do Talk Marista, preservando o projeto Supabase atual.
const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)
  ?? window.TALK_MARISTA_SUPABASE_CONFIG?.url;
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)
  ?? window.TALK_MARISTA_SUPABASE_CONFIG?.publishableKey;

/** `true` quando as variáveis do Supabase foram configuradas. */
export const cloudConfigured = Boolean(url && anonKey);

/** Cliente do Supabase, ou `null` no modo demonstração. */
export const supabase = cloudConfigured
  ? createClient(url!, anonKey!, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;
