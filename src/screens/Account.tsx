import type { ReactNode } from "react";
import { ChevronRight, CircleUserRound, FileText, KeyRound, ShieldCheck, Users } from "lucide-react";
import { Bottom, Logo } from "../components/ui";
import type { Screen, ScreenProps } from "../types";

const LINKS: { icon: ReactNode; title: string; screen: Screen }[] = [
  { icon: <Users />, title: "Familiares", screen: "family" },
  { icon: <ShieldCheck />, title: "Funcionários e prestadores", screen: "workers" },
  { icon: <KeyRound />, title: "Visitantes", screen: "visitors" },
  { icon: <FileText />, title: "Documentos", screen: "documents" },
];

/** Conta do morador: dados básicos, atalhos e sair. 
 * @param s — dados do perfil e estado do aplicativo.
 * @param nav — comandos de navegação.
 * @param onLogout — ação para encerrar a sessão.
 */
export function Account({ s, nav, onLogout }: Pick<ScreenProps, "s" | "nav"> & { onLogout: () => void }) {
  return (
    <div className="screen app">
      <div className="top"><Logo small /></div>
      <main className="content">
        <div className="profile">
          <div><CircleUserRound /></div>
          <span><b>{s.userName}</b><small>Apartamento {s.apartment}</small></span>
        </div>
        {LINKS.map((l) => (
          <button className="account-row" key={l.screen} onClick={() => nav.go(l.screen)}>
            {l.icon}<span>{l.title}</span><ChevronRight />
          </button>
        ))}
        <button className="danger" onClick={onLogout}>Sair da conta</button>
      </main>
      <Bottom active="account" nav={nav} />
    </div>
  );
}
