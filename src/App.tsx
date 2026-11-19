/** MÓDULO: Gerencia o estado global, a autenticação local/nuvem e a navegação entre telas. */
import { useEffect, useState } from "react";
import "./styles.css";
import { cloudConfigured, useAuth } from "./cloud";
import { deleteCloudRecord, insertCloudRecord, loadCloudAppData, updateCloudRecord } from "./cloud/appData";
import { HOME_SCREEN } from "./constants";
import { loadState, saveState } from "./storage";
import type { AddFn, AppState, Nav, ScreenProps, Screen, SessionUser, UpdateFn, RemoveFn } from "./types";

import { Welcome } from "./screens/Welcome";
import { Login } from "./screens/Login";
import { Home } from "./screens/Home";
import { Leisure } from "./screens/Leisure";
import { Reservations } from "./screens/Reservations";
import { Visitors } from "./screens/Visitors";
import { Family } from "./screens/Family";
import { Workers } from "./screens/Workers";
import { Packages } from "./screens/Packages";
import { Info } from "./screens/Info";
import { Account } from "./screens/Account";
import { Gate } from "./screens/Gate";
import { Apartments } from "./screens/Apartments";
import { ResidentMoves } from "./screens/ResidentMoves";

/**
 * Raiz do aplicativo. Cuida de três coisas:
 *  1. Dados e sessão (salvos no aparelho a cada mudança).
 *  2. Navegação por histórico: `go` abre uma tela, `back` volta para a anterior.
 *  3. Escolha de qual tela mostrar.
 * Não recebe parâmetros; consome o contexto de autenticação e monta a tela ativa.
 */
export default function App() {
  const auth = useAuth();
  const [s, setS] = useState<AppState>(loadState);
  const [history, setHistory] = useState<Screen[]>(() => [s.loggedIn ? HOME_SCREEN[s.role] : "welcome"]);
  const screen = history[history.length - 1];

  useEffect(() => saveState(s), [s]);

  /* ---------- Sessão ---------- */

  /** Registra o login e leva para a tela inicial do perfil.
   * @param user — dados do perfil autenticado usados para atualizar o estado local.
   */
  const enter = (user: SessionUser) => {
    setS((prev) => ({ ...prev, loggedIn: true, userName: user.name, apartment: user.apartment, role: user.role,
      visitors: [], family: [], workers: [], packages: [], accesses: [], reservations: [], residents: [], moves: [] }));
    setHistory([HOME_SCREEN[user.role]]);
    if (cloudConfigured) {
      loadCloudAppData(user.apartment, user.role).then((cloudData) => {
        setS((prev) => ({ ...prev, ...cloudData, loggedIn: true, userName: user.name, apartment: user.apartment, role: user.role }));
      }).catch((error) => {
        window.alert(error instanceof Error ? error.message : "Não foi possível carregar os dados do condomínio.");
      });
    }
  };

  /** Encerra a sessão (também na nuvem, se estiver ativa) e volta à tela inicial.
   * Não recebe parâmetros; limpa o estado de login e redefine a navegação.
   */
  const logout = async () => {
    if (cloudConfigured) await auth.signOut();
    setS((prev) => ({ ...prev, loggedIn: false }));
    setHistory(["welcome"]);
  };

  // Restaura a sessão da nuvem ao reabrir o app.
  useEffect(() => {
    const p = auth.profile;
    if (p) enter({ name: p.full_name, apartment: p.apartment ?? "", role: p.role });
  }, [auth.profile]);

  /* ---------- Navegação ---------- */

  const nav: Nav = {
    go: (next) => setHistory((h) => (h[h.length - 1] === next ? h : [...h, next])),
    tab: (next) => setHistory(next === HOME_SCREEN[s.role] ? [next] : [HOME_SCREEN[s.role], next]),
    // Se não há tela anterior, voltar encerra a sessão.
    back: () => (history.length > 1 ? setHistory((h) => h.slice(0, -1)) : logout()),
  };

  /* ---------- Dados ---------- */

  /** Acrescenta um registro a uma das listas (visitantes, encomendas, reservas...).
   * @param collection — nome da coleção que receberá o novo item.
   * @param item — registro com o formato correspondente à coleção escolhida.
   */
  const add: AddFn = (collection, item) => {
    if (cloudConfigured && s.loggedIn) {
      void insertCloudRecord(collection, item as unknown as Record<string, any>).then((saved) => {
        setS((prev) => ({ ...prev, [collection]: [...(prev[collection] as unknown[]), saved] }) as AppState);
      }).catch((error) => window.alert(error instanceof Error ? error.message : "Falha ao salvar na nuvem."));
      return;
    }
    setS((prev) => ({ ...prev, [collection]: [...(prev[collection] as unknown[]), item] }) as AppState);
  };

  /* ---------- Telas ---------- */

  const update: UpdateFn = (collection, id, changes) => {
    if (cloudConfigured && s.loggedIn) {
      void updateCloudRecord(collection, id, changes as Record<string, any>).then((saved) => {
        setS((prev) => ({ ...prev, [collection]: (prev[collection] as Array<{ id: string }>).map((item) => item.id === id ? saved : item) }) as AppState);
      }).catch((error) => window.alert(error instanceof Error ? error.message : "Falha ao atualizar na nuvem."));
      return;
    }
    setS((prev) => ({ ...prev, [collection]: (prev[collection] as Array<{ id: string }>).map((item) => item.id === id ? { ...item, ...changes } : item) }) as AppState);
  };
  const remove: RemoveFn = (collection, id) => {
    if (cloudConfigured && s.loggedIn) {
      void deleteCloudRecord(collection, id).then(() => {
        setS((prev) => ({ ...prev, [collection]: (prev[collection] as Array<{ id: string }>).filter((item) => item.id !== id) }) as AppState);
      }).catch((error) => window.alert(error instanceof Error ? error.message : "Falha ao excluir na nuvem."));
      return;
    }
    setS((prev) => ({ ...prev, [collection]: (prev[collection] as Array<{ id: string }>).filter((item) => item.id !== id) }) as AppState);
  };

  const props: ScreenProps = { s, add, update, remove, nav };

  switch (screen) {
    case "welcome":        return <Welcome onStart={() => nav.go("login")} />;
    case "login":          return <Login enter={enter} />;
    case "home":           return <Home s={s} nav={nav} />;
    case "leisure":        return <Leisure nav={nav} />;
    case "reservations":   return <Reservations {...props} />;
    case "visitors":       return <Visitors {...props} />;
    case "family":         return <Family {...props} />;
    case "workers":        return <Workers {...props} />;
    case "packages":       return <Packages {...props} />;
    case "services":       return <Info kind="services" nav={nav} />;
    case "communications": return <Info kind="communications" nav={nav} />;
    case "documents":      return <Info kind="documents" nav={nav} />;
    case "access":         return <Gate {...props} onLogout={logout} />;
    case "moves":          return <ResidentMoves {...props} />;
    case "apartments":     return <Apartments s={s} nav={nav} />;
    case "account":        return <Account s={s} nav={nav} onLogout={logout} />;
  }
}
