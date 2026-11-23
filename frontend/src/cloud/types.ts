/** MÓDULO: Define os formatos dos dados retornados e enviados ao Supabase. */
/** Modelos das tabelas do banco. Mantidos aqui para telas e serviços usarem o mesmo formato. */

export type UserRole = "morador" | "portaria";

/** Perfil do usuário logado: define apartamento e permissões. */
export interface Profile {
  id: string;
  full_name: string;
  apartment: string | null;
  role: UserRole;
}

/** Tabela `packages` (encomendas). */
export interface PackageRow {
  id: string;
  apartment: string;
  recipient: string;
  kind: "Caixa" | "Embalagem" | "Pacote";
  size: "Extra pequeno" | "Pequeno" | "Médio" | "Grande" | "Extra grande";
  /** Caminho da foto no Storage (bucket `package-photos`). */
  photo_path: string | null;
  status: string;
  received_at: string;
  picked_up_at: string | null;
}

/** Tabela `visitors` (visitantes). */
export interface VisitorRow {
  id: string;
  apartment: string;
  name: string;
  visitor_type: string;
  visit_date: string;
  status: string;
}
