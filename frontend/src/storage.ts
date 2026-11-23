/** MÓDULO: Cria, lê e grava os dados demonstrativos no armazenamento local do navegador. */
import type { AppState } from "./types";

/** Chave do armazenamento local. Mudou para v3 porque o formato das encomendas mudou. */
const STORAGE_KEY = "talk-marista-v3";

/** Dados fictícios para explorar o protótipo sem banco de dados. 
 * @param Não recebe parâmetros; monta as listas iniciais e os registros fictícios para exploração.
 */
export function createInitialState(): AppState {
  return {
    loggedIn: false,
    role: "morador",
    userName: "Morador",
    apartment: "",
    visitors: [
      { id: "demo-v1", name: "Mariana Oliveira", apartment: "1203", date: "2026-10-30", status: "Autorizada", type: "Visita" },
      { id: "demo-v2", name: "Carlos Mendes", apartment: "1203", date: "2026-10-31", status: "Aguardando", type: "Familiar" },
      { id: "demo-v3", name: "Fernanda Costa", apartment: "804", date: "2026-10-30", status: "Autorizada", type: "Prestador" },
    ],
    family: [
      { id: "demo-f1", name: "Ana Oliveira", apartment: "1203", relation: "Mãe" },
      { id: "demo-f2", name: "Pedro Oliveira", apartment: "1203", relation: "Filho(a)" },
    ],
    workers: [
      { id: "demo-w1", name: "Roberto Silva", apartment: "1203", type: "Prestador de serviço", company: "Manutenção", active: true },
    ],
    packages: [
      { id: "demo-p1", recipient: "Vinícius Oliveira", apartment: "1203", kind: "Caixa", size: "Médio", status: "Recebida", receivedAt: "29/10/2026 09:15" },
      { id: "demo-p2", recipient: "Fernanda Costa", apartment: "804", kind: "Pacote", size: "Pequeno", status: "Recebida", receivedAt: "29/10/2026 10:40" },
      { id: "demo-p3", recipient: "Vinícius Oliveira", apartment: "1203", kind: "Embalagem", size: "Extra pequeno", status: "Retirada", receivedAt: "28/10/2026 16:20" },
    ],
    accesses: [
      { id: "demo-a1", apartment: "1203", person: "Mariana Oliveira", type: "Visita", status: "Autorizado", time: "09:32" },
      { id: "demo-a2", apartment: "804", person: "Fernanda Costa", type: "Prestador", status: "Saída registrada", time: "10:05" },
    ],
    reservations: [
      { id: "demo-r1", apartment: "1203", area: "Salão de Festas", date: "2026-11-07", time: "18:00", status: "Confirmada" },
    ],
    residents: [
      { id: "demo-res1", name: "Vinícius Oliveira", apartment: "1203", kind: "Proprietário", phone: "" },
      { id: "demo-res2", name: "Ana Oliveira", apartment: "1203", kind: "Dependente", phone: "" },
    ],
    moves: [],
  };
}

/** Lê o estado salvo no aparelho (ou cria o inicial). 
 * @param Não recebe parâmetros; tenta recuperar o estado salvo e usa dados iniciais se não houver dados válidos.
 */
export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return { ...createInitialState(), ...parsed,
      residents: Array.isArray(parsed.residents) ? parsed.residents : [],
      moves: Array.isArray(parsed.moves) ? parsed.moves : [],
    };
  } catch {
    return createInitialState();
  }
}

/** Salva o estado no aparelho. Pode falhar se o espaço do navegador acabar (muitas fotos). 
 * @param state — estado completo que será convertido para JSON e salvo no navegador.
 */
export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    console.warn("Não foi possível salvar: armazenamento do navegador cheio.");
  }
}

/** Gera um identificador único para novos registros. 
 * @param Não recebe parâmetros; combina data/hora e caracteres aleatórios para gerar um identificador local.
 */
export function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
