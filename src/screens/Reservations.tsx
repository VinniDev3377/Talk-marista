import { useState } from "react";
import { CalendarDays, Check, X, Trash2, Clock3 } from "lucide-react";
import { APARTMENTS, LEISURE_SPACES } from "../constants";
import { newId } from "../storage";
import { Bottom, Empty, Header, ListItem, LocalModeNotice, Section, ResidentTopTabs } from "../components/ui";
import type { ScreenProps } from "../types";

const SPACE_HOURS: Record<string, { start: string; end: string }> = {
  "Espaço Gourmet": { start: "08:00", end: "00:30" },
  "Espaço Grill": { start: "08:00", end: "00:30" },
  "Salão de Festas": { start: "08:00", end: "00:30" },
  "Brinquedoteca": { start: "08:00", end: "22:00" },
  "Academia": { start: "05:00", end: "23:00" },
  "Sauna": { start: "08:00", end: "23:00" },
  "Piscina": { start: "08:00", end: "22:00" },
};

function isWithinHours(time: string, hours?: { start: string; end: string }) {
  if (!hours) return true;
  return hours.end < hours.start ? time >= hours.start || time <= hours.end : time >= hours.start && time <= hours.end;
}

/** Reservas de lazer com validação dos horários definidos para cada ambiente. */
export function Reservations({ s, add, update, remove, nav }: ScreenProps) {
  const [spaceName, setSpaceName] = useState(LEISURE_SPACES[0].name);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [targetApartment, setTargetApartment] = useState("");
  const [validationError, setValidationError] = useState("");
  const space = LEISURE_SPACES.find((x) => x.name === spaceName) ?? LEISURE_SPACES[0];
  const hours = SPACE_HOURS[spaceName];
  const isGate = s.role === "portaria";
  const mine = isGate ? s.reservations : s.reservations.filter((r) => r.apartment === s.apartment);
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const save = () => {
    const apartment = isGate ? targetApartment : s.apartment;
    if (!date || date < today || !time || !apartment) return;
    if (!isWithinHours(time, hours)) {
      setValidationError(hours ? `O horário permitido para ${spaceName} é das ${hours.start} às ${hours.end}.` : "O horário deste espaço deve ser confirmado com a administração.");
      return;
    }
    setValidationError("");
    add("reservations", { id: newId(), apartment, area: spaceName, date, time, status: isGate ? "Aprovada" : "Aguardando aprovação" });
    setDate("");
  };
  return <div className="screen app">
    <Header title="Reservas" back={nav.back} />
    {!isGate && <ResidentTopTabs active="reservations" nav={nav} />}
    <main className="content">
      <Section title="Agende seu espaço" subtitle="Próximas reservas" icon={<CalendarDays />} />
      <LocalModeNotice />
      <div className="form">
        <div className="space-preview" style={{ backgroundImage: `url(${space.image})` }} />
        {isGate && <label>Apartamento<select value={targetApartment} onChange={e => setTargetApartment(e.target.value)}><option value="">Selecione</option>{APARTMENTS.map(a => <option key={a}>{a}</option>)}</select></label>}
        <label>Espaço<select value={spaceName} onChange={e => { setSpaceName(e.target.value); setValidationError(""); }}>{LEISURE_SPACES.map(x => <option key={x.id}>{x.name}</option>)}</select></label>
        {hours ? <p className="muted"><Clock3 size={15} /> Horário permitido: {hours.start} às {hours.end}</p> : <p className="muted"><Clock3 size={15} /> Horário a confirmar com a administração.</p>}
        <div className="two">
          <label>Data<input type="date" min={today} value={date} onChange={e => { setDate(e.target.value); setValidationError(""); }} /></label>
          <label>Horário<input type="time" value={time} onChange={e => { setTime(e.target.value); setValidationError(""); }} /></label>
        </div>
        {validationError && <p className="error-note" role="alert">{validationError}</p>}
        <button className="primary" disabled={!date || date < today || !time || (isGate && !targetApartment)} onClick={save}><Check /> {isGate ? "CADASTRAR RESERVA" : "SOLICITAR RESERVA"}</button>
      </div>
      {mine.map(r => <ListItem key={r.id} icon={<CalendarDays />} thumb={LEISURE_SPACES.find(x => x.name === r.area)?.image}
        title={r.area} sub={`Apto ${r.apartment} · ${r.date} às ${r.time}`} status={r.status}
        action={isGate ? <div className="reservation-review">
          {r.status === "Aguardando aprovação" && <><button className="mini" onClick={() => update("reservations", r.id, { status: "Aprovada" })}><Check /> Aprovar</button><button className="mini warn" onClick={() => update("reservations", r.id, { status: "Recusada" })}><X /> Recusar</button></>}
          <button className="mini warn" onClick={() => { if (window.confirm("Excluir esta reserva?")) remove("reservations", r.id); }}><Trash2 /> Excluir</button>
        </div> : undefined} />)}
      {!mine.length && <Empty text={isGate ? "Nenhuma solicitação de reserva." : "Você ainda não possui reservas."} />}
    </main>
    {!isGate && <Bottom active="reservations" nav={nav} />}
  </div>;
}
