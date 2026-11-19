import { useState } from "react";
import { CalendarDays, Check, X, Trash2 } from "lucide-react";
import { APARTMENTS, LEISURE_SPACES } from "../constants";
import { newId } from "../storage";
import { Bottom, Empty, Header, ListItem, LocalModeNotice, Section, ResidentTopTabs } from "../components/ui";
import type { ScreenProps } from "../types";

/** Reserva de espaços de lazer do morador. 
 * @param s — estado do aplicativo, incluindo apartamento e reservas.
 * @param add — função que inclui a nova reserva.
 * @param nav — comandos de navegação entre telas.
 */
export function Reservations({ s, add, update, remove, nav }: ScreenProps) {
  const [spaceName, setSpaceName] = useState(LEISURE_SPACES[0].name);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [targetApartment, setTargetApartment] = useState("");

  const space = LEISURE_SPACES.find((x) => x.name === spaceName) ?? LEISURE_SPACES[0];
  const isGate = s.role === "portaria";
  const mine = isGate ? s.reservations : s.reservations.filter((r) => r.apartment === s.apartment);

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const save = () => {
    const apartment = isGate ? targetApartment : s.apartment;
    if (!date || date < today || !time || !apartment) return;
    add("reservations", { id: newId(), apartment, area: spaceName, date, time, status: isGate ? "Aprovada" : "Aguardando aprovação" });
    setDate("");
  };

  return (
    <div className="screen app">
      <Header title="Reservas" back={nav.back} />
      {!isGate && <ResidentTopTabs active="reservations" nav={nav} />}
      <main className="content">
        <Section title="Agende seu espaço" subtitle="Próximas reservas" icon={<CalendarDays />} />
        <LocalModeNotice />

        <div className="form">
          <div className="space-preview" style={{ backgroundImage: `url(${space.image})` }} />
          {isGate && <label>Apartamento<select value={targetApartment} onChange={e => setTargetApartment(e.target.value)}><option value="">Selecione</option>{APARTMENTS.map(a => <option key={a}>{a}</option>)}</select></label>}
          <label>Espaço
            <select value={spaceName} onChange={(e) => setSpaceName(e.target.value)}>
              {LEISURE_SPACES.map((x) => <option key={x.id}>{x.name}</option>)}
            </select>
          </label>
          <div className="two">
            <label>Data<input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} /></label>
            <label>Horário<input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></label>
          </div>
          <button className="primary" disabled={!date || date < today || !time || (isGate && !targetApartment)} onClick={save}><Check /> {isGate ? "CADASTRAR RESERVA" : "SOLICITAR RESERVA"}</button>
        </div>

        {mine.map((r) => (
          <ListItem
            key={r.id}
            icon={<CalendarDays />}
            thumb={LEISURE_SPACES.find((x) => x.name === r.area)?.image}
            title={r.area}
            sub={`Apto ${r.apartment} · ${r.date} às ${r.time}`}
            status={r.status}
            action={isGate ? <div className="reservation-review">{r.status === "Aguardando aprovação" && <><button className="mini" onClick={() => update("reservations", r.id, { status: "Aprovada" })}><Check /> Aprovar</button><button className="mini warn" onClick={() => update("reservations", r.id, { status: "Recusada" })}><X /> Recusar</button></>}<button className="mini warn" onClick={() => { if (window.confirm("Excluir esta reserva?")) remove("reservations", r.id); }}><Trash2 /> Excluir</button></div> : undefined}
          />
        ))}
        {!mine.length && <Empty text={isGate ? "Nenhuma solicitação de reserva." : "Você ainda não possui reservas."} />}
      </main>
      {!isGate && <Bottom active="reservations" nav={nav} />}
    </div>
  );
}
