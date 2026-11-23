/** MÓDULO: Concentra operações genéricas de leitura, gravação, atualização, exclusão e tempo real. */
/**
 * Operações genéricas de banco (listar, inserir, atualizar, remover, escutar).
 * Os endpoints em `api.ts` são montados em cima delas.
 */
import { supabase } from "./client";

type Filters = Record<string, string | number | boolean>;
type Row = Record<string, unknown>;

/** Garante que o app não tente usar a nuvem sem configuração. 
 * @param Não recebe parâmetros; verifica se o cliente Supabase foi configurado antes de acessar a nuvem.
 */
function requireCloud() {
  if (!supabase) throw new Error("Supabase não configurado. Preencha o .env.local.");
  return supabase;
}

/** Lista registros de uma tabela, com filtros de igualdade e ordenação (mais novos primeiro). 
 * @param table — nome da tabela consultada.
 * @param filters — filtros de igualdade aplicados às colunas.
 * @param orderBy — coluna usada para ordenar os resultados em ordem decrescente.
 */
export function listRows(table: string, filters: Filters = {}, orderBy = "created_at") {
  let query = requireCloud().from(table).select("*").order(orderBy, { ascending: false });
  for (const [column, value] of Object.entries(filters)) query = query.eq(column, value);
  return query;
}

/** Insere um registro e devolve a linha criada. 
 * @param table — nome da tabela de destino.
 * @param payload — campos do registro que será inserido.
 */
export function insertRow(table: string, payload: Row) {
  return requireCloud().from(table).insert(payload).select().single();
}

/** Atualiza um registro pelo id e devolve a linha atualizada. 
 * @param table — nome da tabela de destino.
 * @param id — identificador do registro alterado.
 * @param payload — campos que serão atualizados.
 */
export function updateRow(table: string, id: string, payload: Row) {
  return requireCloud().from(table).update(payload).eq("id", id).select().single();
}

/** Remove um registro pelo id. 
 * @param table — nome da tabela de destino.
 * @param id — identificador do registro removido.
 */
export function deleteRow(table: string, id: string) {
  return requireCloud().from(table).delete().eq("id", id);
}

/** Escuta mudanças em tempo real. Devolve a função que cancela a escuta. 
 * @param table — tabela monitorada em tempo real.
 * @param callback — função que recebe o evento enviado pelo Supabase.
 */
export function subscribeTable(table: string, callback: (payload: unknown) => void) {
  const client = requireCloud();
  const channel = client
    .channel(`live-${table}-${Math.random().toString(36).slice(2)}`)
    .on("postgres_changes", { event: "*", schema: "public", table }, callback)
    .subscribe();
  return () => { client.removeChannel(channel); };
}
