/** MÓDULO: Consulta e cria perfis associados às contas autenticadas no Supabase. */
import { supabase } from "./client";
import type { Profile } from "./types";

/**
 * Busca o perfil do usuário logado (nome, apartamento e perfil de acesso).
 * Usado logo após o login e ao reabrir o app para restaurar a sessão.
 
 * @param Não recebe parâmetros; identifica a sessão atual e consulta o perfil correspondente.
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  if (!supabase) return null;

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id,full_name,apartment,role")
    .eq("id", auth.user.id)
    .maybeSingle();

  if (error) throw error;
  return data as Profile | null;
}

/**
 * Cria o perfil de um usuário recém-cadastrado.
 * A tabela `profiles` aponta para `auth.users`, garantindo identidade segura.
 
 * @param profile — dados do perfil a serem associados ao usuário autenticado.
 */
export async function createProfile(profile: Profile) {
  if (!supabase) throw new Error("Supabase não configurado.");
  return supabase.from("profiles").insert(profile).select().single();
}
