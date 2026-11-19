import { useState, type FormEvent } from "react";
import { Header, Empty, ListItem } from "../components/ui";
import { newId } from "../storage";
import type { MoveRequest, ScreenProps } from "../types";

/** Área do morador para enviar pré-solicitações e acompanhar a decisão da Portaria. */
export function ResidentMoves({ s, add, nav }: ScreenProps) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<MoveRequest["kind"]>("Entrada");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [company, setCompany] = useState("");
  const today = new Date().toLocaleDateString("en-CA");
  const rows = s.moves.filter((m) => m.apartment === s.apartment).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!date || date < today || !s.apartment) return;
    add("moves", { id: newId(), apartment: s.apartment, kind, date, time, company: company.trim(), status: "Aguardando aprovação", requestedBy: s.userName });
    setOpen(false); setDate(""); setCompany("");
  };
  return <div className="screen app"><Header title="Solicitações de mudança" back={nav.back} /><main className="content">
    <p>Escolha uma data e horário para sua mudança. A solicitação será registrada no banco e ficará aguardando a aprovação da Portaria.</p>
    <button className="primary" onClick={() => setOpen(true)}>Nova pré-solicitação</button>
    {rows.map((m) => <ListItem key={m.id} icon={<span>↔</span>} title={`Mudança de ${m.kind.toLowerCase()}`} sub={`${m.date} às ${m.time} · ${m.company || "Sem empresa informada"}`} status={m.status} />)}
    {!rows.length && <Empty text="Você ainda não possui solicitações de mudança." />}
  </main>
  {open && <div className="modal-backdrop"><form className="modal" onSubmit={submit}><h2>Pré-solicitação de mudança</h2>
    <label>Tipo<select value={kind} onChange={(e) => setKind(e.target.value as MoveRequest["kind"])}><option>Entrada</option><option>Saída</option></select></label>
    <label>Data desejada<input type="date" min={today} required value={date} onChange={(e) => setDate(e.target.value)} /></label>
    <label>Horário<input type="time" required value={time} onChange={(e) => setTime(e.target.value)} /></label>
    <label>Empresa / responsável<input value={company} onChange={(e) => setCompany(e.target.value)} /></label>
    <div className="modal-actions"><button type="button" onClick={() => setOpen(false)}>Cancelar</button><button className="primary" type="submit">Enviar para aprovação</button></div>
  </form></div>}
  </div>;
}
