import { useEffect, useState } from "react";
import { Building2, CalendarDays, Check, ChevronRight, Clock3, DoorOpen, Package, Search, ShieldCheck, Users, Wrench, Trash2, UserPlus } from "lucide-react";
import { newId } from "../storage";
import { Empty, Header, ListItem, LocalModeNotice, Modal, Section, PhotoPicker } from "../components/ui";
import { cloudConfigured } from "../cloud/client";
import type { ScreenProps, Visitor, Resident, MoveRequest } from "../types";
import { APARTMENTS } from "../constants";
import { listResidentRegistrationRequests, reviewResidentRegistration, managePortariaUsers, type RegistrationRequest, type ManagedProfile } from "../cloud";

/**
 * Painel da portaria: controle de acesso, visitantes e atalho para encomendas.
 * É a tela inicial do perfil portaria; por isso o botão voltar encerra a sessão
 * (veja `back` em App.tsx).
 
 * @param s — dados atuais usados pela portaria.
 * @param add — função para registrar movimentações de acesso.
 * @param nav — comandos de navegação.
 * @param onLogout — ação para encerrar a sessão.
 */
export function Gate({ s, add, update, remove, nav, onLogout }: ScreenProps & { onLogout: () => void }) {
  const [query, setQuery] = useState("");
  const [section, setSection] = useState<"painel" | "moradores" | "mudancas" | "cadastros">("painel");
  const [registrationRequests, setRegistrationRequests] = useState<RegistrationRequest[]>([]);
  const [registrationError, setRegistrationError] = useState("");
  const [reviewBusy, setReviewBusy] = useState("");
  const [residentOpen, setResidentOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [managedUsers, setManagedUsers] = useState<ManagedProfile[]>([]);
  const [userError, setUserError] = useState("");
  const q = query.trim().toLowerCase();

  // Busca a fila somente quando a Portaria abre a aba de cadastros pendentes.
  useEffect(() => {
    if (section !== "cadastros" || !cloudConfigured) return;
    let active = true;
    Promise.all([listResidentRegistrationRequests(), managePortariaUsers({ action: "list" })])
      .then(([rows, users]) => { if (active) { setRegistrationRequests(rows); setManagedUsers(users.users ?? []); setRegistrationError(""); } })
      .catch(err => { if (active) setRegistrationError(err instanceof Error ? err.message : "Falha ao carregar cadastros."); });
    return () => { active = false; };
  }, [section]);

  const reviewRegistration = async (id: string, decision: "approve" | "reject") => {
    setReviewBusy(id); setRegistrationError("");
    try {
      await reviewResidentRegistration(id, decision);
      setRegistrationRequests(rows => rows.filter(row => row.id !== id));
    } catch (err) { setRegistrationError(err instanceof Error ? err.message : "Não foi possível revisar o cadastro."); }
    finally { setReviewBusy(""); }
  };

  const visitors = s.visitors.filter((v) => !q || v.name.toLowerCase().includes(q) || v.apartment.includes(q));
  const pending = s.accesses.filter((a) => a.status === "Aguardando").length;
  const waitingPackages = s.packages.filter((p) => p.status === "Recebida").length;
  const pendingMoves = s.moves.filter((m) => m.status === "Aguardando aprovação").length;
  const pendingReservations = s.reservations.filter((r) => r.status === "Aguardando aprovação").length;

  /** Libera a entrada de um visitante e registra no histórico. */
  const authorize = (visitor: Visitor) =>
    add("accesses", {
      id: newId(),
      apartment: visitor.apartment,
      person: visitor.name,
      type: visitor.type,
      status: "Autorizado",
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    });

  return (
    <div className="screen app">
      <Header title="Portaria" action={<span className="live"><i /> {cloudConfigured ? "CONECTADO" : "MODO LOCAL"}</span>} />
      <nav className="gate-tabs" aria-label="Seções da portaria">
        <button className={section === "painel" ? "on" : ""} onClick={() => setSection("painel")}>Resumo</button>
        <button className={section === "moradores" ? "on" : ""} onClick={() => setSection("moradores")}>Moradores</button>
        <button className={section === "mudancas" ? "on" : ""} onClick={() => setSection("mudancas")}>Mudanças {pendingMoves ? `(${pendingMoves})` : ""}</button>
        <button className={section === "cadastros" ? "on" : ""} onClick={() => setSection("cadastros")}>Cadastros</button>
      </nav>
      <main className="content">
        {section === "painel" && <>
        <div className="gate-head">
          <div><small>OPERAÇÃO</small><h2>Controle de acesso</h2></div>
        </div>
        <LocalModeNotice />

        <div className="gate-cards">
          <div><DoorOpen /><b>{pending}</b><small>Acessos pendentes</small></div>
          <div><Package /><b>{waitingPackages}</b><small>Encomendas</small></div>
          <div><Users /><b>{s.visitors.length}</b><small>Visitantes</small></div>
          <div><Wrench /><b>{s.workers.filter((worker) => worker.active).length}</b><small>Equipe ativa</small></div>
          <div><CalendarDays /><b>{pendingReservations}</b><small>Reservas pendentes</small></div>
        </div>

        <button className="primary gate-action" onClick={() => nav.go("packages")}><Package /> ENCOMENDAS</button>
        <div className="gate-shortcuts" aria-label="Acesso rápido da portaria">
          <button type="button" onClick={() => nav.go("reservations")}><CalendarDays /> Reservas</button>
          <button type="button" onClick={() => nav.go("visitors")}><Users /> Visitantes</button>
          <button type="button" onClick={() => nav.go("workers")}><Wrench /> Prestadores</button>
        </div>

        <div className="search">
          <Search />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar visitante ou apartamento" />
        </div>

        <Section title="Visitantes autorizados" subtitle="Controle de acesso" icon={<ShieldCheck />} />
        {visitors.map((v) => (
          <div className="gate-row" key={v.id}>
            <div className="record-icon"><Users /></div>
            <div><b>{v.name}</b><small>Apto {v.apartment} · {v.type}</small></div>
            <button onClick={() => authorize(v)}><Check /> LIBERAR</button>
          </div>
        ))}
        {!visitors.length && <Empty text="Nenhum visitante localizado." />}

        <Section title="Atividade recente" subtitle="Acessos e encomendas" icon={<Clock3 />} />
        {[
          ...s.accesses.map((a) => ({ id: `access-${a.id}`, at: a.time, title: a.person, sub: `Apto ${a.apartment} · Acesso`, status: a.status, kind: "access" as const })),
          ...s.packages.map((p) => ({ id: `package-${p.id}`, at: p.withdrawnAt || p.receivedAt, title: p.recipient, sub: `Apto ${p.apartment} · ${p.status === "Retirada" ? "Encomenda retirada" : "Encomenda recebida"}`, status: p.status, kind: "package" as const })),
        ].slice(-12).reverse().map((item) => <ListItem key={item.id} icon={item.kind === "access" ? <DoorOpen /> : <Package />} title={item.title} sub={`${item.sub} · ${item.at}`} status={item.status} />)}

        </>}
        {section === "moradores" && <ResidentsPanel {...{s, add, update, remove}} onAdd={() => setResidentOpen(true)} />}
        {section === "mudancas" && <MovesPanel s={s} update={update} />}
        {section === "cadastros" && <section className="management-section">
          <button className="primary" onClick={() => setUserOpen(true)}><UserPlus /> CRIAR CADASTRO DE MORADOR OU PORTARIA</button>
          {userError && <p className="error-note" role="alert">{userError}</p>}
          <Section title="Contas cadastradas" subtitle="Moradores e equipe da Portaria" icon={<Users />} />
          {managedUsers.map(user => <ListItem key={user.id} icon={<Users />} thumb={user.avatar_url ?? undefined} title={user.full_name} sub={user.role === "portaria" ? "Portaria" : `Morador · Apto ${user.apartment ?? "—"}`} action={<button className="mini warn" onClick={async () => { if (!window.confirm(`Excluir a conta de ${user.full_name}? O acesso será removido.`)) return; setUserError(""); try { await managePortariaUsers({ action: "delete", userId: user.id }); setManagedUsers(rows => rows.filter(row => row.id !== user.id)); } catch (err) { setUserError(err instanceof Error ? err.message : "Falha ao excluir conta."); } }}><Trash2 /> Excluir</button>} />)}
          <Section title="Cadastros aguardando aprovação" subtitle="Novos acessos de moradores" icon={<ShieldCheck />} />
          {!cloudConfigured && <p className="error-note">Conecte o Supabase para consultar os pedidos reais.</p>}
          {registrationError && <p className="error-note" role="alert">{registrationError}</p>}
          {registrationRequests.map(request => <div className="management-row" key={request.id}>
            <div><b>{request.full_name}</b><small>Apartamento {request.apartment} · Pedido em {new Date(request.created_at).toLocaleString("pt-BR")}</small></div>
            <button className="mini" disabled={reviewBusy === request.id} onClick={() => reviewRegistration(request.id, "approve")}>{reviewBusy === request.id ? "Aguarde..." : "Aprovar"}</button>
            <button className="mini warn" disabled={reviewBusy === request.id} onClick={() => reviewRegistration(request.id, "reject")}>Recusar</button>
          </div>)}
          {!registrationRequests.length && !registrationError && cloudConfigured && <Empty text="Nenhum cadastro aguardando aprovação." />}
        </section>}
        {residentOpen && <ResidentModal add={add} close={() => setResidentOpen(false)} />}
        {userOpen && <PortariaUserModal onClose={() => setUserOpen(false)} onCreated={user => setManagedUsers(rows => [...rows, user].sort((a,b) => a.full_name.localeCompare(b.full_name)))} onError={setUserError} />}
        <button className="danger" onClick={onLogout}>Sair da portaria</button>
      </main>
    </div>
  );
}


function ResidentsPanel({ s, add, update, remove, onAdd }: Pick<ScreenProps, "s" | "add" | "update" | "remove"> & { onAdd: () => void }) {
  const [query, setQuery] = useState("");
  const [selectedApartment, setSelectedApartment] = useState<string | null>(null);
  const list = APARTMENTS.filter((apartment) => apartment.includes(query.trim()));
  const residents = selectedApartment ? s.residents.filter((person) => person.apartment === selectedApartment) : [];
  const family = selectedApartment ? s.family.filter((person) => person.apartment === selectedApartment) : [];
  const workers = selectedApartment ? s.workers.filter((person) => person.apartment === selectedApartment) : [];
  const visitors = selectedApartment ? s.visitors.filter((person) => person.apartment === selectedApartment) : [];
  const hasPeople = residents.length + family.length + workers.length + visitors.length > 0;
  const peopleCount = (apartment: string) => s.residents.filter((p) => p.apartment === apartment).length
    + s.family.filter((p) => p.apartment === apartment).length
    + s.workers.filter((p) => p.apartment === apartment && p.active).length;

  return <section className="management-section">
    <div className="search"><Search /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar apartamento" /></div>
    <div className="apartment-grid gate-apartment-grid">
      {list.map((apartment) => <button type="button" key={apartment} className="gate-apartment-card" onClick={() => setSelectedApartment(apartment)} aria-label={`Abrir apartamento ${apartment}`}>
        <div className="apt-number"><Building2 /></div><b>{apartment}</b><small className="apartment-count">{peopleCount(apartment)} pessoas cadastradas</small><ChevronRight />
      </button>)}
    </div>
    {!list.length && <Empty text="Nenhum apartamento encontrado." />}
    {selectedApartment && <Modal title={`Apartamento ${selectedApartment}`} close={() => setSelectedApartment(null)}>
      <div className="apartment-people-list">
        <Section title="Moradores" subtitle="Pessoas vinculadas" icon={<Users />} />
        {residents.map((person) => cloudConfigured
          ? <ListItem key={`resident-${person.id}`} icon={<Users />} thumb={person.avatarUrl} title={person.name} sub={`Morador · Apto ${person.apartment}`} />
          : <ResidentRow key={`resident-${person.id}`} resident={person} update={update} remove={remove} />)}
        <Section title="Familiares" subtitle="Vínculos familiares" icon={<Users />} />
        {family.map((person) => <ListItem key={`family-${person.id}`} icon={<Users />} title={person.name} sub={person.relation} />)}
        <Section title="Funcionários e prestadores" subtitle="Pessoas autorizadas" icon={<Wrench />} />
        {workers.map((person) => <ListItem key={`worker-${person.id}`} icon={<Wrench />} title={person.name} sub={`${person.type}${person.company ? ` · ${person.company}` : ""}`} status={person.active ? "Ativo" : "Inativo"} />)}
        <Section title="Visitantes" subtitle="Autorizações registradas" icon={<ShieldCheck />} />
        {visitors.map((person) => <ListItem key={`visitor-${person.id}`} icon={<ShieldCheck />} title={person.name} sub={`${person.type} · ${person.date}`} status={person.status} />)}
        {!hasPeople && <Empty text="Ainda não há pessoas cadastradas neste apartamento." />}
      </div>
    </Modal>}
    {!cloudConfigured && <button className="primary" onClick={onAdd}>Cadastrar morador</button>}
  </section>;
}

function ResidentRow({ resident, update, remove }: { resident: Resident; update: ScreenProps["update"]; remove: ScreenProps["remove"] }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(resident.name);
  const [phone, setPhone] = useState(resident.phone ?? "");
  return <div className="management-row"><div><b>{resident.name}</b><small>Apto {resident.apartment} · {resident.kind} · {resident.phone || "Sem telefone"}</small></div>
    <button className="mini" onClick={() => setEditing((v) => !v)}>{editing ? "Fechar" : "Editar"}</button>
    <button className="mini warn" onClick={() => { if (window.confirm(`Excluir ${resident.name}?`)) remove("residents", resident.id); }}>Excluir</button>
    {editing && <div className="inline-edit"><label>Nome<input value={name} onChange={(e) => setName(e.target.value)} /></label><label>Telefone<input value={phone} onChange={(e) => setPhone(e.target.value)} /></label><button className="primary" disabled={!name.trim()} onClick={() => { update("residents", resident.id, { name: name.trim(), phone: phone.trim() }); setEditing(false); }}>Salvar alterações</button></div>}
  </div>;
}

function ResidentModal({ add, close }: { add: ScreenProps["add"]; close: () => void }) {
  const [name, setName] = useState(""); const [apartment, setApartment] = useState("");
  const [kind, setKind] = useState<Resident["kind"]>("Proprietário"); const [phone, setPhone] = useState("");
  return <div className="modal-backdrop"><form className="modal" onSubmit={(e) => { e.preventDefault(); if (!name.trim() || !apartment) return; add("residents", { id: newId(), name: name.trim(), apartment, kind, phone: phone.trim() }); close(); }}>
    <h2>Cadastrar morador</h2><label>Nome completo<input required value={name} onChange={(e) => setName(e.target.value)} /></label>
    <label>Apartamento<select required value={apartment} onChange={(e) => setApartment(e.target.value)}><option value="">Selecione</option>{APARTMENTS.map((a) => <option key={a}>{a}</option>)}</select></label>
    <label>Vínculo<select value={kind} onChange={(e) => setKind(e.target.value as Resident["kind"])}><option>Proprietário</option><option>Inquilino</option><option>Dependente</option></select></label>
    <label>Telefone<input value={phone} onChange={(e) => setPhone(e.target.value)} /></label>
    <div className="modal-actions"><button type="button" onClick={close}>Cancelar</button><button className="primary" type="submit">Salvar morador</button></div>
  </form></div>;
}

function PortariaUserModal({ onClose, onCreated, onError }: { onClose: () => void; onCreated: (user: ManagedProfile) => void; onError: (message: string) => void }) {
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"morador" | "portaria">("morador");
  const [apartment, setApartment] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [photo, setPhoto] = useState<string>();
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true); onError("");
    try {
      const result = await managePortariaUsers({ action: "create", fullName, role, apartment, email, password, photo });
      onCreated({ id: result.id, full_name: result.fullName, apartment: result.apartment, role: result.role, avatar_url: result.avatarPath ? undefined : null, created_at: new Date().toISOString() });
      onClose();
    } catch (error) { onError(error instanceof Error ? error.message : "Não foi possível criar a conta."); }
    finally { setBusy(false); }
  };
  return <Modal title="Criar conta de acesso" close={onClose}>
    <PhotoPicker label="Foto do perfil" value={photo} onChange={setPhoto} />
    <label>Nome completo<input value={fullName} onChange={e => setFullName(e.target.value)} autoComplete="name" /></label>
    <label>Tipo de conta<select value={role} onChange={e => setRole(e.target.value as "morador" | "portaria")}><option value="morador">Morador</option><option value="portaria">Portaria</option></select></label>
    {role === "morador" ? <label>Apartamento<select value={apartment} onChange={e => setApartment(e.target.value)}><option value="">Selecione</option>{APARTMENTS.map(a => <option key={a}>{a}</option>)}</select></label> : <label>E-mail de acesso<input type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="off" /></label>}
    <label>Senha inicial<input type="password" value={password} onChange={e => setPassword(e.target.value)} minLength={8} autoComplete="new-password" /></label>
    <p className="muted">A senha deve ter pelo menos 8 caracteres. O morador usará nome completo e apartamento para entrar; a Portaria usará e-mail e senha.</p>
    <div className="modal-actions"><button type="button" onClick={onClose}>Cancelar</button><button className="primary" disabled={busy || fullName.trim().split(/\\s+/).length < 2 || password.length < 8 || (role === "morador" ? !apartment : !email.includes("@"))} onClick={save}>{busy ? "CRIANDO..." : "CRIAR CONTA"}</button></div>
  </Modal>;
}

function MovesPanel({ s, update }: Pick<ScreenProps, "s" | "update">) {
  return <section className="management-section">
    {[...s.moves].sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time)).map((m) => <div className="management-row" key={m.id}><div><b>Apto {m.apartment} · Mudança de {m.kind.toLowerCase()}</b><small>{m.date} às {m.time} · {m.company || "Sem empresa informada"} · Solicitante: {m.requestedBy}</small></div><em>{m.status}</em>
      {m.status === "Aguardando aprovação" && <><button className="mini" onClick={() => update("moves", m.id, { status: "Aprovada", reviewedAt: new Date().toLocaleString("pt-BR") })}>Aprovar</button><button className="mini warn" onClick={() => update("moves", m.id, { status: "Recusada", reviewedAt: new Date().toLocaleString("pt-BR") })}>Recusar</button></>}
      {m.status === "Aprovada" && <button className="mini" onClick={() => update("moves", m.id, { status: "Concluída" })}>Concluir</button>}
    </div>)}{!s.moves.length && <Empty text="Nenhuma solicitação de mudança." />}</section>;
}

