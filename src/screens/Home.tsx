import type { ReactNode } from "react";
import {
  ArrowRight, Bell, CalendarDays, FileText, KeyRound, Package, ShieldCheck,
  Sparkles, Users, Wrench, Truck,
} from "lucide-react";
import { BUILDING_IMAGE } from "../constants";
import { Action, Bottom, LocalModeNotice, Logo, ResidentTopTabs } from "../components/ui";
import type { Screen, ScreenProps } from "../types";

/** Atalhos do painel do morador. Para incluir um novo, basta adicionar uma linha. */
const ACTIONS: { icon: ReactNode; title: string; sub: string; screen: Screen }[] = [
  { icon: <CalendarDays />, title: "Reservas", sub: "Lazer e espaços", screen: "reservations" },
  { icon: <Bell />, title: "Comunicados", sub: "Avisos do condomínio", screen: "communications" },
  { icon: <Wrench />, title: "Serviços", sub: "Solicitações", screen: "services" },
  { icon: <Users />, title: "Visitantes", sub: "Acessos autorizados", screen: "visitors" },
  { icon: <KeyRound />, title: "Familiares", sub: "Pai, mãe, filhos...", screen: "family" },
  { icon: <ShieldCheck />, title: "Prestadores", sub: "Pessoas autorizadas", screen: "workers" },
  { icon: <Package />, title: "Encomendas", sub: "Chegadas na portaria", screen: "packages" },
  { icon: <FileText />, title: "Documentos", sub: "Arquivos", screen: "documents" },
  { icon: <Truck />, title: "Mudanças", sub: "Solicitar entrada ou saída", screen: "moves" },
];

/** Painel inicial do morador. 
 * @param s — estado e perfil do morador conectado.
 * @param nav — comandos para abrir as funcionalidades do aplicativo.
 */
export function Home({ s, nav }: Pick<ScreenProps, "s" | "nav">) {
  return (
    <div className="screen app">
      <div className="top">
        <Logo small />
        <button className="icon-btn" onClick={() => nav.go("communications")} aria-label="Comunicados"><Bell /></button>
      </div>
      <ResidentTopTabs active="home" nav={nav} />
      <main className="content">
        <section className="hello">
          <div>
            <small>Olá, {s.userName}</small>
            <h1>Tudo que você precisa,<br />em um só lugar.</h1>
          </div>
          <span className="apt">Apto {s.apartment}</span>
        </section>
        <LocalModeNotice />

        <button type="button" className="hero-card" style={{ backgroundImage: `url(${BUILDING_IMAGE})` }} onClick={() => nav.go("leisure")} aria-label="Conhecer e reservar áreas de lazer">
          <div className="hero-shade" />
          <div>
            <small>TALK MARISTA</small>
            <b>ÁREAS DE LAZER</b>
            <span>Conheça os ambientes e faça sua reserva</span>
          </div>
          <i><ArrowRight /></i>
        </button>

        <div className="grid">
          {ACTIONS.map((a) => (
            <Action key={a.screen} icon={a.icon} title={a.title} sub={a.sub} onClick={() => nav.go(a.screen)} />
          ))}
        </div>

        <div className="banner">
          <Sparkles />
          <div><b>Exclusividade em cada detalhe</b><span>Uma experiência digital feita para o condomínio.</span></div>
        </div>
      </main>
      <Bottom active="home" nav={nav} />
    </div>
  );
}
