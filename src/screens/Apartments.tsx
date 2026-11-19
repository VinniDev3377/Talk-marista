import { useState } from "react";
import { Building2, ChevronRight, Search } from "lucide-react";
import { APARTMENTS } from "../constants";
import { Header } from "../components/ui";
import type { ScreenProps } from "../types";

/** Lista de apartamentos com a quantidade de movimentações de cada um. 
 * @param s — estado geral usado para resumir movimentações por unidade.
 * @param nav — comandos de navegação.
 */
export function Apartments({ s, nav }: Pick<ScreenProps, "s" | "nav">) {
  const [query, setQuery] = useState("");
  const list = APARTMENTS.filter((a) => a.includes(query));
  const movements = (apt: string) =>
    s.visitors.filter((v) => v.apartment === apt).length + s.packages.filter((p) => p.apartment === apt).length;

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
            <button key={a}>
              <div className="apt-number"><Building2 /></div>
              <b>{a}</b>
              <small>{movements(a)} movimentações</small>
              <ChevronRight />
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
