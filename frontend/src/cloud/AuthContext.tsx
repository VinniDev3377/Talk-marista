/** MÓDULO: Compartilha o perfil e as operações de autenticação Supabase com toda a interface. */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "./client";
import { getCurrentProfile } from "./auth";
import type { Profile } from "./types";

interface AuthContextValue {
  /** Perfil do usuário logado na nuvem (ou null). */
  profile: Profile | null;
  /** `true` enquanto a sessão salva está sendo verificada. */
  loading: boolean;
  /** Autentica o usuário usando e-mail e senha do Supabase. */
  signIn: (email: string, password: string) => Promise<void>;
  /** Encerra a sessão remota e limpa o perfil em memória. */
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Mantém login e perfil sincronizados com o Supabase. Envolve o app inteiro (main.tsx). 
 * @param children — componentes React que terão acesso ao contexto de autenticação.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    // Reconsulta o perfil depois de abrir o app ou quando o estado de autenticação mudar.
    const refreshProfile = async () => {
      try {
        const current = await getCurrentProfile();
        if (active) setProfile(current);
      } catch (error) {
        // Falha de rede não deve deixar uma rejeição sem tratamento no carregamento.
        if (active) setProfile(null);
        console.warn("Não foi possível restaurar o perfil da nuvem:", error);
      }
    };

    refreshProfile().finally(() => active && setLoading(false));

    if (!supabase) return () => { active = false; };

    // Atualiza o perfil sempre que a pessoa entra ou sai.
    const { data } = supabase.auth.onAuthStateChange(() => { refreshProfile(); });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  // Memoriza as operações e os dados compartilhados para evitar recriações desnecessárias.
  const value = useMemo<AuthContextValue>(() => ({
    profile,
    loading,
    async signIn(email, password) {
      if (!supabase) throw new Error("Configure o Supabase no .env.local.");
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },
    async signOut() {
      if (supabase) {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }
      setProfile(null);
    },
  }), [profile, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Acesso ao login/perfil em qualquer tela. 
 * Não recebe parâmetros; devolve o contexto de autenticação e valida se o provider está ativo.
 */
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  return value;
}
