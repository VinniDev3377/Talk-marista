import { useMemo, useState } from "react";
import { Package, Plus, Search } from "lucide-react";
import { APARTMENTS, PACKAGE_KINDS, PACKAGE_SIZES } from "../constants";
import { newId } from "../storage";
import { Bottom, Chips, Empty, Header, Modal, PhotoPicker, ListItem } from "../components/ui";
import type { AddFn, PackageKind, PackageSize, ScreenProps, Delivery } from "../types";

/**
 * Encomendas.
 *  - Portaria: vê todas e é a ÚNICA que cadastra (nome, apto, tipo, tamanho e foto).
 *  - Admin: vê todas, sem cadastrar.
 *  - Morador: vê apenas as do seu apartamento, sem cadastrar.
 
 * @param s — estado atual com as encomendas e o perfil conectado.
 * @param add — função usada para cadastrar ou atualizar uma encomenda local.
 * @param nav — comandos de navegação entre telas.
 */
export function Packages({ s, add, update, nav }: ScreenProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"pendentes" | "retiradas">("pendentes");
  const [selected, setSelected] = useState<Delivery | null>(null);

  const canRegister = s.role === "portaria";
  const isResident = s.role === "morador";

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return s.packages.filter((p) =>
      (tab === "pendentes" ? p.status === "Recebida" : p.status === "Retirada") &&
      (!isResident || p.apartment === s.apartment) &&
      (!q || p.apartment.includes(q) || p.recipient.toLowerCase().includes(q) || p.kind.toLowerCase().includes(q)),
    );
  }, [s.packages, s.apartment, isResident, query, tab]);

  return (
    <div className="screen app">
      <Header
        title={isResident ? "Encomendas" : "Central de encomendas"}
        back={nav.back}
        action={canRegister && <button className="add" onClick={() => setOpen(true)} aria-label="Registrar encomenda"><Plus /></button>}
      />
      <main className="content">
        <div className="search">
          <Search />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nome, apartamento ou tipo" />
        </div>

        <div className="package-tabs" role="tablist" aria-label="Situação das encomendas">
          <button type="button" className={tab === "pendentes" ? "on" : ""} onClick={() => setTab("pendentes")}>Pendentes ({s.packages.filter((p) => p.status === "Recebida" && (!isResident || p.apartment === s.apartment)).length})</button>
          <button type="button" className={tab === "retiradas" ? "on" : ""} onClick={() => setTab("retiradas")}>Retiradas ({s.packages.filter((p) => p.status === "Retirada" && (!isResident || p.apartment === s.apartment)).length})</button>
        </div>
        <div className="stat">
          <Package />
          <div><b>{rows.length}</b><small>{isResident ? "encomendas do seu apartamento" : "encomendas registradas"}</small></div>
        </div>

        {rows.map((p) => (
          <ListItem
            key={p.id}
            icon={<Package />}
            thumb={p.photo}
            title={`Apto ${p.apartment} · ${p.recipient}`}
            sub={`${p.kind} ${p.size.toLowerCase()} · ${p.receivedAt}${p.withdrawnBy ? ` · Retirada por ${p.withdrawnBy}` : ""}${p.withdrawnAt ? ` · ${p.withdrawnAt}` : ""}`}
            status={p.status}
            action={canRegister && p.status === "Recebida" ? <button className="mini" onClick={() => setSelected(p)}>Registrar retirada</button> : undefined}
          />
        ))}
        {!rows.length && <Empty text="Nenhuma encomenda encontrada." />}

        {canRegister && <button className="primary" onClick={() => setOpen(true)}><Plus /> REGISTRAR ENCOMENDA</button>}
      </main>
      {open && <PackageModal add={add} close={() => setOpen(false)} />}
      {selected && <WithdrawModal item={selected} update={update} close={() => setSelected(null)} />}
      {isResident && <Bottom active="account" nav={nav} />}
    </div>
  );
}

/** Formulário de cadastro de encomenda (somente portaria). 
 * @param add — função que inclui a encomenda no estado local.
 * @param close — ação que fecha o formulário de cadastro.
 */
function PackageModal({ add, close }: { add: AddFn; close: () => void }) {
  const [recipient, setRecipient] = useState("");
  const [apartment, setApartment] = useState("");
  const [kind, setKind] = useState<PackageKind | "">("");
  const [size, setSize] = useState<PackageSize | "">("");
  const [photo, setPhoto] = useState<string | undefined>();

  const ready = recipient.trim() && apartment && kind && size;

  const save = () => {
    if (!kind || !size) return;
    add("packages", {
      id: newId(),
      recipient: recipient.trim(),
      apartment,
      kind,
      size,
      photo,
      status: "Recebida",
      receivedAt: new Date().toLocaleString("pt-BR"),
    });
    close();
  };

  return (
    <Modal title="Registrar encomenda" close={close}>
      <PhotoPicker value={photo} onChange={setPhoto} />
      <label>Nome do destinatário
        <input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Nome completo" autoComplete="off" />
      </label>
      <label>Apartamento
        <select value={apartment} onChange={(e) => setApartment(e.target.value)}>
          <option value="">Selecione</option>
          {APARTMENTS.map((a) => <option key={a}>{a}</option>)}
        </select>
      </label>
      <Chips label="Tipo" options={PACKAGE_KINDS} value={kind} onChange={setKind} />
      <Chips label="Tamanho" options={PACKAGE_SIZES} value={size} onChange={setSize} />
      <button className="primary" disabled={!ready} onClick={save}>REGISTRAR ENCOMENDA</button>
    </Modal>
  );
}


/** Confirma a retirada e grava nome e horário para manter rastreabilidade. */
function WithdrawModal({ item, update, close }: { item: Delivery; update: ScreenProps["update"]; close: () => void }) {
  const [withdrawnBy, setWithdrawnBy] = useState("");
  const ready = withdrawnBy.trim().length >= 3;
  const confirm = () => {
    if (!ready) return;
    update("packages", item.id, {
      status: "Retirada",
      withdrawnBy: withdrawnBy.trim(),
      withdrawnAt: new Date().toLocaleString("pt-BR"),
    });
    close();
  };
  return <Modal title="Confirmar retirada" close={close}>
    <p>Encomenda de {item.recipient} · Apartamento {item.apartment}</p>
    <label>Nome de quem retirou
      <input value={withdrawnBy} onChange={(e) => setWithdrawnBy(e.target.value)} placeholder="Nome completo" autoComplete="off" />
    </label>
    <button className="primary" disabled={!ready} onClick={confirm}>CONFIRMAR RETIRADA</button>
  </Modal>;
}
