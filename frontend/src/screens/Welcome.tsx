import { ArrowRight } from "lucide-react";
import { BUILDING_IMAGE } from "../constants";
import { Logo } from "../components/ui";

/** Primeira tela: foto do prédio e botão de acesso. 
 * @param onStart — callback executado ao tocar no botão de entrada.
 */
export function Welcome({ onStart }: { onStart: () => void }) {
  return (
    <div className="screen photo-screen" style={{ backgroundImage: `url(${BUILDING_IMAGE})` }}>
      <div className="veil" />
      <div className="welcome">
        <Logo />
        <div className="welcome-copy">
          <small>CONDOMÍNIO MARISTA</small>
          <h1>VIVER BEM<br />É O QUE NOS<br />CONECTA</h1>
          <p>Conforto, lazer e praticidade no coração do Marista.</p>
          <button className="light-btn" onClick={onStart}>ACESSAR <ArrowRight /></button>
        </div>
      </div>
    </div>
  );
}
