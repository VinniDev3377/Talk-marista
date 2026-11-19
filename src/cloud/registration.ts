/** Serviço de cadastro pendente e revisão exclusiva pela Portaria. */
import { supabase } from "./client";
export interface RegistrationRequest { id: string; full_name: string; apartment: string; created_at: string; status: "pending" | "approved" | "rejected" }
/** Cria a conta sem liberar perfil ativo; a Edge Function mantém a senha fora das tabelas públicas. */
export async function submitResidentRegistration(input: { fullName: string; apartment: string; password: string }) {
  if (!supabase) throw new Error("Conexão com o Supabase não configurada.");
  const { data, error } = await supabase.functions.invoke("resident-register", { body: input });
  if (error) throw new Error(error.message || "Não foi possível enviar o cadastro.");
  if (data?.error) throw new Error(data.error);
  return data;
}
/** Lista pedidos pendentes; RLS permite leitura somente à Portaria. */
export async function listResidentRegistrationRequests(): Promise<RegistrationRequest[]> {
  if (!supabase) throw new Error("Conexão com o Supabase não configurada.");
  const { data, error } = await supabase.from("resident_registration_requests").select("id,full_name,apartment,created_at,status").eq("status", "pending").order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as RegistrationRequest[];
}
/** Aprova ou recusa um pedido por Edge Function, que valida o papel de Portaria no servidor. */
export async function reviewResidentRegistration(requestId: string, decision: "approve" | "reject") {
  if (!supabase) throw new Error("Conexão com o Supabase não configurada.");
  const { data, error } = await supabase.functions.invoke("resident-review", { body: { requestId, decision } });
  if (error) throw new Error(error.message || "Não foi possível revisar o cadastro.");
  if (data?.error) throw new Error(data.error);
  return data;
}
/** Identificador técnico determinístico; a interface continua solicitando nome, apartamento e senha. */
export function residentLoginEmail(fullName: string, apartment: string) {
  const slug = fullName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `morador-${apartment}-${slug}@talkmarista.invalid`;
}
