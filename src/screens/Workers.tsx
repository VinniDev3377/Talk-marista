import { useState } from "react";
import { Plus, Wrench, Trash2 } from "lucide-react";
import { newId } from "../storage";
import { APARTMENTS } from "../constants";
import { Bottom, Empty, Header, Modal, ListItem, ResidentTopTabs } from "../components/ui";
import type { AddFn, ScreenProps } from "../types";

/** Funcionários e prestadores autorizados. Morador vê os seus; admin vê todos. 
 * @param s — estado atual com funcionários, prestadores e perfil conectado.
 * @param add — função que registra uma nova pessoa autorizada.
 * @param nav — comandos de navegação entre telas.
 */
export function Workers({ s, add, remove, nav }: ScreenProps) {
  const [open, setOpen] = useState(false);
  const isResident = s.role === "morador";
  const isGate = s.role === "portaria";
  const canManage = isResident || isGate;
  const rows = isResident ? s.workers.filter((x) => x.apartment === s.apartment) : s.workers;

  return (
    <div className="screen app">
      <Header
        title="Funcionários e prestadores"
        back={nav.back}
        action={canManage && <button className="add" onClick={() => setOpen(true)}><Plus /></button>}
      />
      {!isGate && <ResidentTopTabs active="workers" nav={nav} />}
      <main className="content">
        <div className="info"><Wrench /><span>Controle pessoas autorizadas a prestar serviços.</span></div>
        {rows.map((x) => (
          <ListItem
            key={x.id}
            icon={<Wrench />}
            title={x.name}
            sub={`${x.type} · ${x.company || "Sem empresa"}${isResident ? "" : ` · Apto ${x.apartment}`}`}
            status={x.active ? "Ativo" : "Inativo"}
            action={isGate ? <button className="mini warn" onClick={() => { if (window.confirm(`Excluir o cadastro de ${x.name}?`)) remove("workers", x.id); }}><Trash2 /> Excluir</button> : undefined}
          />
        ))}
        {!rows.length && <Empty text="Nenhum cadastro encontrado." />}
        {canManage && <button className="primary" onClick={() => setOpen(true)}><Plus /> NOVO CADASTRO</button>}
      </main>
      {open && <WorkerModal apartment={s.apartment} isGate={isGate} add={add} close={() => setOpen(false)} />}
      {isResident && <Bottom active="account" nav={nav} />}
    </div>
  );
}

/**
 * Documentação dos parâmetros da função WorkerModal.
 * @param apartment — apartamento ao qual a autorização ficará vinculada.
 * @param add — função que salva a pessoa autorizada.
 * @param close — ação que fecha o formulário.
 */
function WorkerModal({ apartment, isGate, add, close }: { apartment: string; isGate: boolean; add: AddFn; close: () => void }) {
  const [name, setName] = useState("");
  const [targetApartment, setTargetApartment] = useState(apartment);
  const [type, setType] = useState("Funcionário");
  const [company, setCompany] = useState("");

  const save = () => {
    if (!targetApartment) return;
    add("workers", { id: newId(), name, apartment: targetApartment, type, company, active: true });
    close();
  };

  return (
    <Modal title="Nova pessoa autorizada" close={close}>
      {isGate && <label>Apartamento<select value={targetApartment} onChange={(e) => setTargetApartment(e.target.value)}><option value="">Selecione</option>{APARTMENTS.map((a) => <option key={a}>{a}</option>)}</select></label>}
      <label>Nome<input value={name} onChange={(e) => setName(e.target.value)} /></label>
      <label>Tipo
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option>Funcionário</option><option>Prestador de serviço</option>
        </select>
      </label>
      <label>Empresa / função<input value={company} onChange={(e) => setCompany(e.target.value)} /></label>
      <button className="primary" disabled={!name.trim() || !targetApartment} onClick={save}>SALVAR CADASTRO</button>
    </Modal>
  );
}
