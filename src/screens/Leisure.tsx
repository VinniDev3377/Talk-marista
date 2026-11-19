import { useState } from "react";
import { CalendarDays, ChevronRight } from "lucide-react";
import { LEISURE_SPACES } from "../constants";
import { Bottom, Header } from "../components/ui";
import type { Nav } from "../types";

/** Espaços de lazer: foto grande do espaço escolhido e lista com a foto de cada um. 
 * @param nav — comandos de navegação entre lista de espaços e telas anteriores.
 */
export function Leisure({ nav }: { nav: Nav }) {
  const [index, setIndex] = useState(0);
  const selected = LEISURE_SPACES[index];

  return (
    <div className="screen app">
      <Header title="Áreas de lazer" back={nav.back} />
      <main className="content">
        <div className="large-photo" style={{ backgroundImage: `url(${selected.image})` }}>
          <div className="hero-shade" />
          <div><small>AMBIENTE</small><h2>{selected.name}</h2><span>{selected.description}</span></div>
        </div>

        <div className="dots">
          {LEISURE_SPACES.map((space, i) => (
            <button key={space.id} className={i === index ? "active" : ""} onClick={() => setIndex(i)} aria-label={space.name} />
          ))}
        </div>

        <div className="list">
          {LEISURE_SPACES.map((space, i) => (
            <button key={space.id} className={i === index ? "selected" : ""} onClick={() => setIndex(i)}>
              <img className="space-thumb" src={space.image} alt="" />
              <div><b>{space.name}</b><small>{space.description}</small></div>
              <ChevronRight />
            </button>
          ))}
        </div>

        <button className="primary" onClick={() => nav.go("reservations")}><CalendarDays /> RESERVAR AGORA</button>
      </main>
      <Bottom active="home" nav={nav} />
    </div>
  );
}
