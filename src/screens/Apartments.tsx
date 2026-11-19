import { useState } from "react";
import { Building2, ChevronRight, Search, Users, Wrench, ShieldCheck } from "lucide-react";
import { APARTMENTS } from "../constants";
import { Empty, Header, ListItem, Modal, Section } from "../components/ui";
import type { ScreenProps } from "../types";

/** Lista de apartamentos com a quantidade de movimentações de cada um. 
 * @param s — estado geral usado para resumir movimentações por unidade.
 * @param nav — comandos de navegação.
 */
export function Apartments({ s, nav }: Pick<ScreenProps, "s" | "nav">) {
  const [query, setQuery] = useState("");
  const [selectedApartment, setSelectedApartment] = useState<string | null>(null);
  const list = APARTMENTS.filter((a) => a.includes(query));
  const people = (apt: string) => s.residents.filter((p) => p.apartment === apt).length
    + s.family.filter((p) => p.apartment === apt).length
    + s.workers.filter((p) => p.apartment === apt && p.active).length;

  return (
    <div className="screen app">
      <Header title="Unidades" back={nav.back} />
      <main className="content">
        <div className="search">
          <Search />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar apartamento" />
        </div>
        <div className="apartment-grid">
          {list.map((a) => (
            <button key={a} type="button" onClick={() => setSelectedApartment(a)} aria-label={`Ver pessoas do apartamento ${a}`}>
              <div className="apt-number"><Building2 /></div>
              <b>{a}</b>
              <small>{people(a)} pessoas cadastradas</small>
              <ChevronRight />
            </button>
          ))}
        </div>
        {!list.length && <Empty text="Nenhum apartamento encontrado." />}
        {selectedApartment && <Modal title={`Apartamento ${selectedApartment}`} close={() => setSelectedApartment(null)}>
          <Section title="Moradores" subtitle="Pessoas vinculadas" icon={<Users />} />
          {s.residents.filter(p => p.apartment === selectedApartment).map(p => <ListItem key={`resident-${p.id}`} icon={<Users />} title={p.name} sub={`Morador · Apto ${p.apartment}`} />)}
          <Section title="Familiares" subtitle="Vínculos familiares" icon={<Users />} />
          {s.family.filter(p => p.apartment === selectedApartment).map(p => <ListItem key={`family-${p.id}`} icon={<Users />} title={p.name} sub={p.relation} />)}
          <Section title="Funcionários e prestadores" subtitle="Pessoas autorizadas" icon={<Wrench />} />
          {s.workers.filter(p => p.apartment === selectedApartment).map(p => <ListItem key={`worker-${p.id}`} icon={<Wrench />} title={p.name} sub={`${p.type}${p.company ? ` · ${p.company}` : ""}`} status={p.active ? "Ativo" : "Inativo"} />)}
          <Section title="Visitantes" subtitle="Autorizações registradas" icon={<ShieldCheck />} />
          {s.visitors.filter(p => p.apartment === selectedApartment).map(p => <ListItem key={`visitor-${p.id}`} icon={<ShieldCheck />} title={p.name} sub={`${p.type} · ${p.date}`} status={p.status} />)}
          {!s.residents.some(p => p.apartment === selectedApartment) && !s.family.some(p => p.apartment === selectedApartment) && !s.workers.some(p => p.apartment === selectedApartment) && !s.visitors.some(p => p.apartment === selectedApartment) && <Empty text="Ainda não há pessoas cadastradas neste apartamento." />}
        </Modal>}
      </main>
    </div>
  );
}
