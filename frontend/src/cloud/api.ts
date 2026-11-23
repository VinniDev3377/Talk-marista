/** MÓDULO: Reúne endpoints de domínio para operações remotas de cada módulo do condomínio. */
/**
 * ENDPOINTS DO APLICATIVO (Supabase)
 *
 * Cada função abaixo é um "endpoint": uma operação que a interface pode pedir
 * ao banco. A permissão de quem pode ler/gravar o quê é controlada pelas
 * políticas RLS no `supabase_schema.sql`, não por este arquivo.
 *
 * As telas operacionais usam `src/cloud/appData.ts` para persistência central.
 * Este módulo mantém endpoints específicos usados por notificações e serviços.
 */
import { supabase } from "./client";
import { deleteRow, insertRow, listRows, subscribeTable, updateRow } from "./repositories";
import type { PackageRow, VisitorRow } from "./types";

/* ========================================================================
 * ENCOMENDAS  (tabela `packages`)
 * Cadastro: somente PORTARIA. Consulta: morador (só o seu apto) e portaria.
 * ====================================================================== */

/** Bucket do Storage onde ficam as fotos das encomendas. */
const PHOTO_BUCKET = "package-photos";

/**
 * Lista as encomendas, da mais nova para a mais antiga.
 * Sem `apartment` traz todas (portaria); com `apartment` traz só as daquela unidade.
 
 * @param apartment — apartamento opcional; quando informado, limita o resultado àquela unidade.
 */
export function listPackages(apartment?: string) {
  return listRows("packages", apartment ? { apartment } : {}, "received_at");
}

/**
 * Envia a foto da encomenda para o Storage e devolve o caminho salvo.
 * Recebe a foto como texto base64 (formato gerado por utils/photo.ts).
 
 * @param apartment — unidade usada como pasta no bucket privado.
 * @param dataUrl — imagem codificada em Data URL, normalmente gerada por compressPhoto.
 */
export async function uploadPackagePhoto(apartment: string, dataUrl: string): Promise<string> {
  if (!supabase) throw new Error("Supabase não configurado.");
  const blob = await (await fetch(dataUrl)).blob();
  const path = `${apartment}/${Date.now()}.jpg`; // a pasta é o apartamento: base da regra de acesso
  const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, blob, { contentType: "image/jpeg" });
  if (error) throw error;
  return path;
}

/** Gera um link temporário (1 hora) para exibir a foto de uma encomenda. 
 * @param path — caminho da imagem dentro do bucket package-photos.
 */
export async function getPackagePhotoUrl(path: string): Promise<string> {
  if (!supabase) throw new Error("Supabase não configurado.");
  const { data, error } = await supabase.storage.from(PHOTO_BUCKET).createSignedUrl(path, 3600);
  if (error) throw error;
  return data.signedUrl;
}

/**
 * Registra uma encomenda recebida pela portaria.
 * Se houver foto, ela é enviada primeiro e o caminho fica salvo junto do cadastro.
 
 * @param input — destinatário, apartamento, tipo, tamanho e foto opcional da encomenda.
 */
export async function createPackage(input: {
  recipient: string;
  apartment: string;
  kind: PackageRow["kind"];
  size: PackageRow["size"];
  photo?: string;
}) {
  const { photo, ...fields } = input;
  const photo_path = photo ? await uploadPackagePhoto(input.apartment, photo) : null;
  return insertRow("packages", { ...fields, photo_path, status: "Recebida" });
}

/** Marca uma encomenda como retirada pelo morador. 
 * @param id — identificador da encomenda que será marcada como retirada.
 */
export function pickupPackage(id: string) {
  return updateRow("packages", id, { status: "Retirada", withdrawn_at: new Date().toISOString() });
}

/** Avisa em tempo real quando uma encomenda é criada ou alterada (tela da portaria). 
 * @param callback — função executada quando o Supabase notifica uma alteração na tabela packages.
 */
export const subscribeToPackages = (callback: (payload: unknown) => void) =>
  subscribeTable("packages", callback);

/* ========================================================================
 * VISITANTES  (tabela `visitors`)
 * ====================================================================== */

/** Lista visitantes. Sem `apartment` traz todos (portaria). 
 * @param apartment — apartamento opcional para filtrar os visitantes.
 */
export function listVisitors(apartment?: string) {
  return listRows("visitors", apartment ? { apartment } : {});
}

/** Cadastra uma autorização de visita feita pelo morador. 
 * @param input — dados mínimos da autorização de visita (apartamento, nome, tipo e data).
 */
export function createVisitor(input: Pick<VisitorRow, "apartment" | "name" | "visitor_type" | "visit_date">) {
  return insertRow("visitors", { ...input, status: "Autorizada" });
}

/** Atualiza o status do visitante (ex.: entrou, saiu). Usado pela portaria. 
 * @param id — identificador do visitante.
 * @param status — novo estado da autorização ou movimentação.
 */
export function updateVisitorStatus(id: string, status: string) {
  return updateRow("visitors", id, { status });
}

/** Avisa em tempo real quando há novos visitantes (tela da portaria). 
 * @param callback — função executada quando a tabela visitors recebe uma alteração.
 */
export const subscribeToVisitors = (callback: (payload: unknown) => void) =>
  subscribeTable("visitors", callback);

/* ========================================================================
 * FAMILIARES  (tabela `family_members`)
 * ====================================================================== */

/** Lista os familiares cadastrados em um apartamento. 
 * @param apartment — apartamento opcional usado como filtro.
 */
export const listFamilyMembers = (apartment?: string) =>
  listRows("family_members", apartment ? { apartment } : {});

/** Cadastra um familiar (pai, mãe, filhos...). 
 * @param payload — campos do familiar que será cadastrado.
 */
export const createFamilyMember = (payload: Record<string, unknown>) =>
  insertRow("family_members", payload);

/** Remove um familiar. 
 * @param id — identificador do familiar que será removido.
 */
export const deleteFamilyMember = (id: string) => deleteRow("family_members", id);

/* ========================================================================
 * FUNCIONÁRIOS E PRESTADORES  (tabela `workers`)
 * ====================================================================== */

/** Lista pessoas autorizadas a trabalhar no apartamento. 
 * @param apartment — apartamento opcional usado como filtro.
 */
export const listWorkers = (apartment?: string) =>
  listRows("workers", apartment ? { apartment } : {});

/** Cadastra um funcionário ou prestador de serviço. 
 * @param payload — dados do funcionário ou prestador autorizado.
 */
export const createWorker = (payload: Record<string, unknown>) => insertRow("workers", payload);

/** Ativa ou desativa a autorização de entrada de uma pessoa. 
 * @param id — identificador da pessoa autorizada.
 * @param active — verdadeiro para manter a autorização ativa; falso para desativá-la.
 */
export const setWorkerActive = (id: string, active: boolean) => updateRow("workers", id, { active });

/* ========================================================================
 * RESERVAS DE ESPAÇOS  (tabela `reservations`)
 * ====================================================================== */

/** Lista reservas de espaços de lazer, por data. 
 * @param apartment — apartamento opcional usado como filtro.
 */
export const listReservations = (apartment?: string) =>
  listRows("reservations", apartment ? { apartment } : {}, "reservation_date");

/** Cria uma reserva (espaço, data e horário). 
 * @param payload — espaço, data, horário e apartamento da reserva.
 */
export const createReservation = (payload: Record<string, unknown>) =>
  insertRow("reservations", payload);

/* ========================================================================
 * SOLICITAÇÕES DE SERVIÇO  (tabela `service_requests`)
 * ====================================================================== */

/** Lista pedidos de manutenção, mudança, limpeza etc. 
 * @param apartment — apartamento opcional usado como filtro.
 */
export const listServiceRequests = (apartment?: string) =>
  listRows("service_requests", apartment ? { apartment } : {}, "opened_at");

/** Abre um novo pedido de serviço. 
 * @param payload — dados da solicitação de serviço.
 */
export const createServiceRequest = (payload: Record<string, unknown>) =>
  insertRow("service_requests", payload);

/** Muda o andamento de um pedido (portaria). 
 * @param id — identificador da solicitação.
 * @param status — novo estado do atendimento.
 */
export async function updateServiceRequest(id: string, status: string) {
  if (!supabase) throw new Error("Supabase não configurado.");
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) throw new Error("Sua sessão expirou. Entre novamente.");
  return updateRow("service_requests", id, { status, handled_by: authData.user.id, handled_at: new Date().toISOString() });
}

/* ========================================================================
 * COMUNICADOS  (tabela `communications`)
 * ====================================================================== */

/** Lista os avisos ativos do condomínio, do mais recente para o mais antigo. */
export const listCommunications = () => listRows("communications", { active: true }, "published_at");

/** Publica um novo aviso. 
 * @param payload — título, conteúdo e demais metadados do comunicado.
 */
export const createCommunication = (payload: Record<string, unknown>) =>
  insertRow("communications", { ...payload, active: true });

/* ========================================================================
 * CONTROLE DE ACESSO  (tabela `accesses`)
 * ====================================================================== */

/** Lista o histórico de entradas e saídas. 
 * @param apartment — apartamento opcional para filtrar o histórico.
 */
export const listAccessLogs = (apartment?: string) =>
  listRows("accesses", apartment ? { apartment } : {}, "occurred_at");

/** Registra uma entrada ou saída (portaria). 
 * @param payload — dados da entrada ou saída registrada pela portaria.
 */
export const createAccessLog = (payload: Record<string, unknown>) => insertRow("accesses", payload);

/** Avisa em tempo real quando um acesso é registrado. 
 * @param callback — função executada quando houver alteração na tabela access_logs.
 */
export const subscribeToAccessLogs = (callback: (payload: unknown) => void) =>
  subscribeTable("accesses", callback);


/* ========================================================================
 * NOTIFICAÇÕES PESSOAIS DO MORADOR
 * Cada notificação é associada ao usuário Auth, não apenas ao apartamento.
 * ====================================================================== */
export interface ApartmentNotification {
  id: string;
  apartment: string;
  title: string;
  body: string;
  event_type: string;
  created_at: string;
  read_at: string | null;
}

/** Lista as notificações do usuário atual; RLS limita a consulta à própria conta. */
export async function listMyNotifications(): Promise<ApartmentNotification[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from("apartment_notifications")
    .select("id,apartment,title,body,event_type,created_at,read_at")
    .order("created_at", { ascending: false }).limit(100);
  if (error) throw error;
  return (data ?? []) as ApartmentNotification[];
}

/** Marca uma notificação individual como lida. */
export async function markNotificationRead(id: string) {
  if (!supabase) throw new Error("Supabase não configurado.");
  const { error } = await supabase.from("apartment_notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}

/** Atualiza a lista em tempo real enquanto o morador está na aba de comunicados. */
export const subscribeToMyNotifications = (callback: (payload: unknown) => void) =>
  subscribeTable("apartment_notifications", callback);
