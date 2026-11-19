import { useState } from "react";
import { Plus, ShieldCheck, Users } from "lucide-react";
import { newId } from "../storage";
import { APARTMENTS } from "../constants";
import { Bottom, Empty, Header, Modal, ListItem, ResidentTopTabs } from "../components/ui";
import type { AddFn, ScreenProps, Visitor } from "../types";

/** Visitantes autorizados pelo morador. 
 * @param s — estado atual, incluindo apartamento e visitantes cadastrados.
 * @param add — função para acrescentar uma autorização de visita.
 * @param nav — comandos de navegação entre telas.
 */
export function Visitors({ s, add, nav }: ScreenProps) {
  const [open, setOpen] = useState(false);
  const isGate = s.role === "portaria";
  const mine = isGate ? s.visitors : s.visitors.filter((v) => v.apartment === s.apartment);

  return (
    <div className="screen app">
      <Header title="Visitantes" back={nav.back} action={<button className="add" onClick={() => setOpen(true)}><Plus /></button>} />
      {!isGate && <ResidentTopTabs active="visitors" nav={nav} />}
      <main className="content">
        <div className="info"><ShieldCheck /><span>Cadastre visitantes e agilize o acesso à portaria.</span></div>
        {mine.map((v) => <ListItem key={v.id} icon={<Users />} title={v.name} sub={`${v.type} · ${v.date}`} status={v.status} />)}
        {!mine.length && <Empty text="Nenhuma visita cadastrada." />}
        <button className="primary" onClick={() => setOpen(true)}><Plus /> NOVA VISITA</button>
      </main>
      {open && <VisitorModal apartment={s.apartment} isGate={isGate} add={add} close={() => setOpen(false)} />}
      {!isGate && <Bottom active="account" nav={nav} />}
    </div>
  );
}

/**
 * Documentação dos parâmetros da função VisitorModal.
 * @param apartment — apartamento que receberá a autorização.
 * @param add — função que grava o visitante no estado.
 * @param close — ação para fechar o formulário.
 */
function VisitorModal({ apartment, isGate, add, close }: { apartment: string; isGate: boolean; add: AddFn; close: () => void }) {
  const [name, setName] = useState("");
  const [targetApartment, setTargetApartment] = useState(apartment);
  const [date, setDate] = useState("");
  const [type, setType] = useState<Visitor["type"]>("Visita");

  const save = () => {
    if (!targetApartment) return;
    add("visitors", { id: newId(), name, apartment: targetApartment, date, status: "Autorizada", type });
    close();
  };

  return (
    <Modal title="Cadastrar visita" close={close}>
      {isGate && <label>Apartamento<select value={targetApartment} onChange={(e) => setTargetApartment(e.target.value)}><option value="">Selecione</option>{APARTMENTS.map((a) => <option key={a}>{a}</option>)}</select></label>}
      <label>Nome<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome completo" /></label>
      <label>Tipo
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option>Visita</option><option>Familiar</option><option>Prestador</option>
        </select>
      </label>
      <label>Data<input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
      <button className="primary" disabled={!name.trim() || !date || !targetApartment} onClick={save}>CADASTRAR</button>
    </Modal>
  );
}
