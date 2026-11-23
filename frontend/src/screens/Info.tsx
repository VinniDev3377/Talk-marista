import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Bell, Building2, CheckCircle2, FileText, KeyRound, Sparkles, Wrench } from "lucide-react";
import { Bottom, Header } from "../components/ui";
import type { Nav } from "../types";
import { cloudConfigured, listMyNotifications, markNotificationRead, subscribeToMyNotifications, type ApartmentNotification, useAuth } from "../cloud";
import { createServiceRequest, listServiceRequests, updateServiceRequest } from "../cloud/api";

type InfoKind = "services" | "communications" | "documents";
interface InfoItem { title: string; text: string; icon?: ReactNode }

/** Conteúdo das telas informativas. Edite aqui os textos de serviços, avisos e documentos. */
const PAGES: Record<InfoKind, { title: string; items: InfoItem[] }> = {
  services: {
    title: "Serviços",
    items: [
      { title: "Manutenção", text: "Abra uma solicitação para o condomínio.", icon: <Wrench /> },
      { title: "Mudança", text: "Agende sua entrada ou saída.", icon: <Building2 /> },
      { title: "Chaves / acesso", text: "Solicite apoio para acesso.", icon: <KeyRound /> },
      { title: "Limpeza", text: "Peça atendimento.", icon: <Sparkles /> },
    ],
  },
  communications: {
    title: "Comunicados",
    items: [
      { title: "Manutenção preventiva", text: "A manutenção das bombas ocorrerá amanhã." },
      { title: "Piscina", text: "A piscina está disponível para reservas." },
      { title: "Assembleia", text: "Confira documentos e pauta." },
    ],
  },
  documents: {
    title: "Documentos",
    items: [
      { title: "Regimento interno", text: "Documento disponível" },
      { title: "Convenção do condomínio", text: "Documento disponível" },
      { title: "Atas de assembleia", text: "Documento disponível" },
      { title: "Manual do morador", text: "Documento disponível" },
    ],
  },
};

/** Tela de lista simples (serviços, comunicados ou documentos). 
 * @param kind — define qual conteúdo informativo será exibido (serviços, comunicados ou documentos).
 * @param nav — comandos de navegação.
 */
export function Info({ kind, nav }: { kind: InfoKind; nav: Nav }) {
  const page = PAGES[kind];
  const auth = useAuth();
  const [serviceRows, setServiceRows] = useState<Array<{ id: string; apartment: string; kind: string; description: string; status: string; opened_at: string }>>([]);
  const [serviceKind, setServiceKind] = useState("Manutenção");
  const [serviceDescription, setServiceDescription] = useState("");
  const [serviceError, setServiceError] = useState("");
  const [serviceBusy, setServiceBusy] = useState(false);
  const [notifications, setNotifications] = useState<ApartmentNotification[]>([]);
  const [notificationError, setNotificationError] = useState("");
  const [busyId, setBusyId] = useState("");
  const refreshNotifications = useCallback(async () => {
    if (!cloudConfigured || kind !== "communications") return;
    try { setNotifications(await listMyNotifications()); setNotificationError(""); }
    catch (error) { setNotificationError(error instanceof Error ? error.message : "Não foi possível carregar as notificações."); }
  }, [kind]);

  useEffect(() => {
    if (kind !== "services" || !cloudConfigured || !auth.profile) return;
    let active = true;
    
    listServiceRequests(auth.profile.role === "portaria" ? undefined : auth.profile.apartment ?? "")
      .then(
        ({ data, error }) => {
          if (error) throw error;
          if (active) {
            setServiceRows(data ?? []);
            setServiceError("");
          }
        },
        (error: unknown) => {
          if (active) {
            setServiceError(
              error instanceof Error
                ? error.message
                : "Não foi possível carregar os pedidos."
            );
          }
        }
      );

    return () => { active = false; };
  }, [kind, auth.profile]);

  useEffect(() => {
    if (kind !== "communications" || !cloudConfigured) return;
    void refreshNotifications();
    const unsubscribe = subscribeToMyNotifications(() => { void refreshNotifications(); });
    return unsubscribe;
  }, [kind, refreshNotifications]);

  const readNotification = async (id: string) => {
    setBusyId(id);
    try { await markNotificationRead(id); setNotifications(rows => rows.map(row => row.id === id ? { ...row, read_at: new Date().toISOString() } : row)); }
    catch (error) { setNotificationError(error instanceof Error ? error.message : "Não foi possível atualizar a notificação."); }
    finally { setBusyId(""); }
  };

  return (
    <div className="screen app">
      <Header title={page.title} back={nav.back} />
      <main className="content">
        {kind === "services" && <section className="management-section">
          <div className="form">
            <label>Tipo de solicitação<select value={serviceKind} onChange={e => setServiceKind(e.target.value)}><option>Manutenção</option><option>Limpeza</option><option>Chaves / acesso</option><option>Outro</option></select></label>
            <label>Descreva o que precisa<input value={serviceDescription} onChange={e => setServiceDescription(e.target.value)} placeholder="Explique sua solicitação" /></label>
            <button className="primary" disabled={!cloudConfigured || !auth.profile?.apartment || !serviceDescription.trim() || serviceBusy} onClick={async () => {
              if (!auth.profile?.apartment) return;
              setServiceBusy(true); setServiceError("");
              try { const { data, error } = await createServiceRequest({ apartment: auth.profile.apartment, kind: serviceKind, description: serviceDescription.trim(), status: "Aberta" }); if (error) throw error; if (data) setServiceRows(rows => [data, ...rows]); setServiceDescription(""); }
              catch (error) { setServiceError(error instanceof Error ? error.message : "Não foi possível enviar a solicitação."); }
              finally { setServiceBusy(false); }
            }}>{serviceBusy ? "Enviando..." : "ENVIAR SOLICITAÇÃO"}</button>
          </div>
          {serviceError && <p className="error-note" role="alert">{serviceError}</p>}
          {serviceRows.map(row => <article className="generic-row" key={row.id}><div><Wrench /></div><span><b>{row.kind} · Apto {row.apartment}</b><small>{row.description}</small><small>{new Date(row.opened_at).toLocaleString("pt-BR")}</small></span><em>{row.status}</em>{auth.profile?.role === "portaria" && row.status !== "Concluída" && <button className="mini" onClick={async () => { try { const { error } = await updateServiceRequest(row.id, "Concluída"); if (error) throw error; setServiceRows(rows => rows.map(item => item.id === row.id ? { ...item, status: "Concluída" } : item)); } catch (error) { setServiceError(error instanceof Error ? error.message : "Falha ao atualizar o pedido."); } }}>Concluir</button>}</article>)}
          {!serviceRows.length && !serviceError && <p className="muted">Nenhuma solicitação registrada.</p>}
        </section>}
        {kind === "communications" && <section className="management-section notification-section">
          <div className="section"><div><small>ATUALIZAÇÕES DO SEU APARTAMENTO</small><h2>Notificações</h2></div><Bell /></div>
          {!cloudConfigured && <p className="muted">As notificações compartilhadas serão exibidas quando a conexão e a migração de notificações do Supabase estiverem ativadas.</p>}
          {notificationError && <p className="error-note" role="alert">{notificationError}</p>}
          {notifications.map(item => <article className={`generic-row notification-row ${item.read_at ? "is-read" : "is-new"}`} key={item.id}>
            <div><Bell /></div><span><b>{item.title}</b><small>{item.body}</small><small>{new Date(item.created_at).toLocaleString("pt-BR")}</small></span>
            {!item.read_at && <button className="mini" disabled={busyId === item.id} onClick={() => void readNotification(item.id)}><CheckCircle2 /> Lida</button>}
          </article>)}
          {cloudConfigured && !notificationError && notifications.length === 0 && <p className="muted">Nenhuma atualização registrada para seu apartamento.</p>}
        </section>}
        {kind !== "services" && page.items.map((item) => (
          <article className="generic-row" key={item.title}>
            <div>{item.icon ?? <FileText />}</div>
            <span><b>{item.title}</b><small>{item.text}</small></span>
          </article>
        ))}
      </main>
      <Bottom active={kind === "communications" ? "communications" : "account"} nav={nav} />
    </div>
  );
}
