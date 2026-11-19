/** Persistência das telas operacionais no esquema Supabase já existente do condomínio. */
import { supabase } from "./client";
import type { AppState, Collection } from "../types";

const TABLES: Record<Collection, string> = {
  visitors: "visitors", family: "family_members", workers: "workers", packages: "packages",
  accesses: "accesses", reservations: "reservations", moves: "moves",
};
const uuid = () => globalThis.crypto?.randomUUID?.() ?? "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === "x" ? r : (r & 3 | 8)).toString(16); });
const dateTime = (date?: string, time?: string) => { const now = new Date(); const stamp = date && time ? new Date(`${date}T${time}`) : time ? new Date(`${now.toISOString().slice(0, 10)}T${time}`) : now; return stamp.toISOString(); };
const localTime = (value?: string) => value ? new Date(value).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "";
const localDate = (value?: string) => value ? new Date(value).toLocaleDateString("pt-BR") : "";

function fromRow(collection: Collection, row: Record<string, any>): any {
  switch (collection) {
    case "visitors": return { id: row.id, apartment: row.apartment, name: row.name, date: row.visit_date, status: row.status, type: row.visitor_type };
    case "family": return { id: row.id, apartment: row.apartment, name: row.name, relation: row.relation };
    case "workers": return { id: row.id, apartment: row.apartment, name: row.name, type: row.worker_type, company: row.company ?? "", active: row.active };
    case "packages": return { id: row.id, apartment: row.apartment, recipient: row.recipient, kind: row.kind, size: row.size, status: row.status, receivedAt: row.received_at ? new Date(row.received_at).toLocaleString("pt-BR") : "", withdrawnAt: localDate(row.withdrawn_at), withdrawnBy: row.withdrawn_by_name ?? "", photoPath: row.photo_path ?? undefined };
    case "accesses": return { id: row.id, apartment: row.apartment, person: row.person, type: row.access_type, status: row.status, time: localTime(row.occurred_at) };
    case "reservations": return { id: row.id, apartment: row.apartment, area: row.area, date: row.reservation_date, time: String(row.reservation_time ?? "").slice(0, 5), status: row.status };
    case "residents": return { id: row.id, apartment: row.apartment, name: row.name, kind: row.kind, phone: row.phone ?? "" };
    case "moves": return { id: row.id, apartment: row.apartment, kind: row.kind, date: row.move_date, time: String(row.move_time ?? "").slice(0, 5), company: row.company ?? "", status: row.status, requestedBy: row.requested_by ?? "", reviewedAt: row.reviewed_at ?? undefined };
  }
}

function toRow(collection: Collection, item: Record<string, any>, userId: string, changes = false): Record<string, unknown> {
  const common = changes ? {} : { id: item.id && /^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(item.id) ? item.id : uuid() };
  switch (collection) {
    case "visitors": return { ...common, ...(item.name !== undefined ? { name: item.name } : {}), ...(item.apartment !== undefined ? { apartment: item.apartment } : {}), ...(item.date !== undefined ? { visit_date: item.date } : {}), ...(item.type !== undefined ? { visitor_type: item.type } : {}), ...(item.status !== undefined ? { status: item.status } : {}), ...(!changes ? { created_by: userId } : {}) };
    case "family": return { ...common, ...(item.name !== undefined ? { name: item.name } : {}), ...(item.apartment !== undefined ? { apartment: item.apartment } : {}), ...(item.relation !== undefined ? { relation: item.relation } : {}), ...(!changes ? { created_by: userId } : {}) };
    case "workers": return { ...common, ...(item.name !== undefined ? { name: item.name } : {}), ...(item.apartment !== undefined ? { apartment: item.apartment } : {}), ...(item.type !== undefined ? { worker_type: item.type } : {}), ...(item.company !== undefined ? { company: item.company } : {}), ...(item.active !== undefined ? { active: item.active } : {}), ...(!changes ? { created_by: userId } : {}) };
    case "packages": return { ...common, ...(item.recipient !== undefined ? { recipient: item.recipient } : {}), ...(item.apartment !== undefined ? { apartment: item.apartment } : {}), ...(item.kind !== undefined ? { kind: item.kind } : {}), ...(item.size !== undefined ? { size: item.size } : {}), ...(item.status !== undefined ? { status: item.status } : {}), ...(item.status === "Retirada" ? { withdrawn_at: new Date().toISOString(), withdrawn_by_name: item.withdrawnBy ?? "" , withdrawn_by: userId } : {}), ...(!changes ? { received_at: new Date().toISOString(), received_by: userId } : {}) };
    case "accesses": return { ...common, ...(item.apartment !== undefined ? { apartment: item.apartment } : {}), ...(item.person !== undefined ? { person: item.person } : {}), ...(item.type !== undefined ? { access_type: item.type } : {}), ...(item.status !== undefined ? { status: item.status } : {}), ...(item.time !== undefined ? { occurred_at: dateTime(undefined, item.time) } : { occurred_at: new Date().toISOString() }), ...(!changes ? { recorded_by: userId } : {}) };
    case "reservations": return { ...common, ...(item.apartment !== undefined ? { apartment: item.apartment } : {}), ...(item.area !== undefined ? { area: item.area } : {}), ...(item.date !== undefined ? { reservation_date: item.date } : {}), ...(item.time !== undefined ? { reservation_time: item.time } : {}), ...(item.status !== undefined ? { status: item.status } : {}), ...(!changes ? { created_by: userId } : {}) };
    case "residents": return { ...common, ...(item.apartment !== undefined ? { apartment: item.apartment } : {}), ...(item.name !== undefined ? { name: item.name } : {}), ...(item.kind !== undefined ? { kind: item.kind } : {}), ...(item.phone !== undefined ? { phone: item.phone } : {}) };
    case "moves": return { ...common, ...(item.apartment !== undefined ? { apartment: item.apartment } : {}), ...(item.kind !== undefined ? { kind: item.kind } : {}), ...(item.date !== undefined ? { move_date: item.date } : {}), ...(item.time !== undefined ? { move_time: item.time } : {}), ...(item.company !== undefined ? { company: item.company } : {}), ...(item.status !== undefined ? { status: item.status } : {}), ...(!changes ? { requested_by: userId } : {}), ...(changes && item.status ? { reviewed_by: userId, reviewed_at: new Date().toISOString() } : {}) };
  }
}

export async function loadCloudAppData(apartment: string, role: string): Promise<Partial<AppState>> {
  if (!supabase) throw new Error("Supabase não configurado.");
  const collections = (Object.keys(TABLES) as Collection[]).filter(collection => collection !== "residents");
  const results = await Promise.all(collections.map(async collection => {
    let query = supabase!.from(TABLES[collection]).select("*");
    if (role === "morador" && ["visitors", "family", "workers", "packages", "accesses", "reservations", "residents", "moves"].includes(collection)) query = query.eq("apartment", apartment);
    const { data, error } = await query;
    if (error) throw new Error(`Falha ao carregar ${TABLES[collection]}: ${error.message}`);
    return [collection, (data ?? []).map(row => fromRow(collection, row))] as const;
  }));
  const state = Object.fromEntries(results) as Partial<AppState>;
  // Moradores são perfis autenticados; não existe tabela operacional `residents` no schema atual.
  const { data: residentProfiles, error: residentError } = await supabase.from("profiles")
    .select("id,full_name,apartment,role").eq("role", "morador");
  if (residentError) throw new Error(`Falha ao carregar moradores: ${residentError.message}`);
  state.residents = (residentProfiles ?? []).filter(row => row.apartment).map(row => ({
    id: row.id, name: row.full_name, apartment: row.apartment, kind: "Proprietário" as const, phone: "",
  }));
  if (supabase && state.packages?.length) {
    state.packages = await Promise.all(state.packages.map(async (item: any) => {
      if (!item.photoPath) return item;
      const { data } = await supabase!.storage.from("package-photos").createSignedUrl(item.photoPath, 3600);
      return { ...item, photo: data?.signedUrl };
    }));
  }
  return state;
}

export async function insertCloudRecord(collection: Collection, item: Record<string, any>) {
  if (!supabase) throw new Error("Supabase não configurado.");
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) throw new Error("Sua sessão expirou. Entre novamente.");
  const payload = toRow(collection, item, authData.user.id);
  if (collection === "packages" && typeof item.photo === "string" && item.photo.startsWith("data:")) {
    const imageId = String(payload.id);
    const blob = await (await fetch(item.photo)).blob();
    const path = `${item.apartment}/${imageId}.jpg`;
    const { error: uploadError } = await supabase.storage.from("package-photos").upload(path, blob, { contentType: "image/jpeg", upsert: false });
    if (uploadError) throw new Error(`Não foi possível enviar a foto da encomenda: ${uploadError.message}`);
    payload.photo_path = path;
  }
  const { data, error } = await supabase.from(TABLES[collection]).insert(payload).select("*").single();
  if (error) {
    if (collection === "packages" && payload.photo_path) await supabase.storage.from("package-photos").remove([String(payload.photo_path)]);
    throw new Error(`Não foi possível salvar em ${TABLES[collection]}: ${error.message}`);
  }
  const saved = fromRow(collection, data);
  if (collection === "packages" && data.photo_path) {
    const { data: signed } = await supabase.storage.from("package-photos").createSignedUrl(data.photo_path, 3600);
    saved.photo = signed?.signedUrl;
  }
  return saved;
}

export async function updateCloudRecord(collection: Collection, id: string, changes: Record<string, any>) {
  if (!supabase) throw new Error("Supabase não configurado.");
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) throw new Error("Sua sessão expirou. Entre novamente.");
  if (collection === "residents") throw new Error("Os moradores são gerenciados pelos perfis aprovados da portaria.");
  const payload = toRow(collection, changes, authData.user.id, true);
  const { data, error } = await supabase.from(TABLES[collection]).update(payload).eq("id", id).select("*").single();
  if (error) throw new Error(`Não foi possível atualizar ${TABLES[collection]}: ${error.message}`);
  const saved = fromRow(collection, data);
  if (collection === "packages" && data.photo_path) {
    const { data: signed } = await supabase.storage.from("package-photos").createSignedUrl(data.photo_path, 3600);
    saved.photo = signed?.signedUrl;
  }
  return saved;
}

export async function deleteCloudRecord(collection: Collection, id: string) {
  if (!supabase) throw new Error("Supabase não configurado.");
  if (collection === "residents") throw new Error("Os moradores são gerenciados pelos perfis aprovados da portaria.");
  const { error } = await supabase.from(TABLES[collection]).delete().eq("id", id);
  if (error) throw new Error(`Não foi possível excluir de ${TABLES[collection]}: ${error.message}`);
}
