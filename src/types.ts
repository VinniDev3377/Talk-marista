/** MÓDULO: Define os contratos de dados, navegação, telas e estado da aplicação. */
import type { UserRole } from "./cloud/types";

/** Perfis de acesso do aplicativo. */
export type Role = UserRole;

/** Todas as telas do aplicativo. Para criar uma tela nova, adicione o nome aqui e em App.tsx. */
export type Screen =
  | "welcome" | "login" | "home" | "leisure" | "reservations" | "visitors"
  | "family" | "workers" | "packages" | "services" | "communications"
  | "documents" | "account" | "apartments" | "access" | "moves";

/** Navegação entregue a cada tela. */
export interface Nav {
  /** Abre uma tela nova (empilha no histórico). */
  go: (screen: Screen) => void;
  /** Troca de aba na barra inferior (zera o histórico). */
  tab: (screen: Screen) => void;
  /** Volta para a tela anterior. Na tela inicial do perfil, encerra a sessão. */
  back: () => void;
}

/** Dados do usuário que acabou de entrar. */
export interface SessionUser {
  name: string;
  apartment: string;
  role: Role;
}

/* ---------- Encomendas ---------- */
export type PackageKind = "Caixa" | "Embalagem" | "Pacote";
export type PackageSize = "Extra pequeno" | "Pequeno" | "Médio" | "Grande" | "Extra grande";

/* ---------- Registros guardados no aparelho ---------- */
export interface Visitor { id: string; name: string; apartment: string; date: string; status: string; type: string }
export interface FamilyMember { id: string; name: string; apartment: string; relation: string }
export interface Worker { id: string; name: string; apartment: string; type: string; company: string; active: boolean }
export interface Access { id: string; apartment: string; person: string; type: string; status: string; time: string }
export interface Reservation { id: string; apartment: string; area: string; date: string; time: string; status: string }
export interface Delivery {
  withdrawnBy?: string;
  withdrawnAt?: string;
  id: string;
  recipient: string;
  apartment: string;
  kind: PackageKind;
  size: PackageSize;
  /** Foto tirada pela portaria (imagem JPEG em texto base64). */
  photo?: string;
  status: "Recebida" | "Retirada";
  receivedAt: string;
}

/** Cadastro de morador mantido pela Portaria. */
export interface Resident { id: string; name: string; apartment: string; kind: "Proprietário" | "Inquilino" | "Dependente"; phone?: string }
/** Solicitação de mudança criada pelo morador e analisada pela Portaria. */
export interface MoveRequest { id: string; apartment: string; kind: "Entrada" | "Saída"; date: string; time: string; company: string; status: "Aguardando aprovação" | "Aprovada" | "Recusada" | "Concluída"; requestedBy: string; reviewedAt?: string }

/** Espaço de lazer do prédio. */
export interface LeisureSpace {
  id: string;
  name: string;
  description: string;
  image: string;
}

/** Estado completo do aplicativo (sessão + dados). */
export interface AppState {
  loggedIn: boolean;
  role: Role;
  userName: string;
  apartment: string;
  visitors: Visitor[];
  family: FamilyMember[];
  workers: Worker[];
  packages: Delivery[];
  accesses: Access[];
  reservations: Reservation[];
  residents: Resident[];
  moves: MoveRequest[];
}

/** Listas de AppState que aceitam novos registros. */
export type Collection = "visitors" | "family" | "workers" | "packages" | "accesses" | "reservations" | "residents" | "moves";

/** Adiciona um registro a uma das listas. */
export type AddFn = <K extends Collection>(collection: K, item: AppState[K][number]) => void;
export type UpdateFn = <K extends Collection>(collection: K, id: string, changes: Partial<AppState[K][number]>) => void;
export type RemoveFn = (collection: Collection, id: string) => void;

/** Propriedades comuns a quase todas as telas. */
export interface ScreenProps {
  s: AppState;
  add: AddFn;
  update: UpdateFn;
  remove: RemoveFn;
  nav: Nav;
}
