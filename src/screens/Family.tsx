import { useState } from "react";
import { CircleUserRound, Plus, Users } from "lucide-react";
import { FAMILY_RELATIONS } from "../constants";
import { newId } from "../storage";
import { Bottom, Empty, Header, Modal, ListItem, Section } from "../components/ui";
import type { AddFn, ScreenProps } from "../types";

/** Familiares vinculados ao apartamento. 
 * @param s — estado do aplicativo com apartamento e lista de familiares.
 * @param add — função que inclui um familiar no estado local.
 * @param nav — comandos para voltar ou trocar de tela.
 */
export function Family({ s, add, nav }: ScreenProps) {
  const [open, setOpen] = useState(false);
  const mine = s.family.filter((x) => x.apartment === s.apartment);

  return (
    <div className="screen app">
      <Header title="Familiares" back={nav.back} action={<button className="add" onClick={() => setOpen(true)}><Plus /></button>} />
      <main className="content">
        <Section title="Pessoas vinculadas" subtitle="Minha família" icon={<Users />} />
        {mine.map((x) => <ListItem key={x.id} icon={<CircleUserRound />} title={x.name} sub={x.relation} />)}
        {!mine.length && <Empty text="Cadastre pai, mãe, filhos, avós ou outros familiares." />}
        <button className="primary" onClick={() => setOpen(true)}><Plus /> ADICIONAR FAMILIAR</button>
      </main>
      {open && <FamilyModal apartment={s.apartment} add={add} close={() => setOpen(false)} />}
      <Bottom active="account" nav={nav} />
    </div>
  );
}

/**
 * Documentação dos parâmetros da função FamilyModal.
 * @param apartment — apartamento ao qual o familiar será vinculado.
 * @param add — função responsável por salvar o novo familiar.
 * @param close — ação que fecha o formulário.
 */
function FamilyModal({ apartment, add, close }: { apartment: string; add: AddFn; close: () => void }) {
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("Filho(a)");

  const save = () => {
    add("family", { id: newId(), name, apartment, relation });
    close();
  };

  return (
    <Modal title="Cadastrar familiar" close={close}>
      <label>Nome<input value={name} onChange={(e) => setName(e.target.value)} /></label>
      <label>Parentesco
        <select value={relation} onChange={(e) => setRelation(e.target.value)}>
          {FAMILY_RELATIONS.map((x) => <option key={x}>{x}</option>)}
        </select>
      </label>
      <button className="primary" disabled={!name} onClick={save}>SALVAR FAMILIAR</button>
    </Modal>
  );
}
