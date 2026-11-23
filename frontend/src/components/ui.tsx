/** MÓDULO: Disponibiliza componentes visuais reutilizáveis para manter padrão entre as telas. */
/** Componentes visuais reutilizados em várias telas. */
import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import {
  ArrowLeft, Bell, CalendarDays, Camera, ChevronRight, CircleUserRound,
  Home, Sparkles, Trash2, X,
} from "lucide-react";
import type { Nav, Screen } from "../types";
import { compressPhoto } from "../utils/photo";
import { cloudConfigured } from "../cloud/client";

/** Logotipo Talk Marista. 
 * @param small — quando verdadeiro, aplica a variação compacta do logotipo.
 */
export function Logo({ small = false }: { small?: boolean }) {
  return (
    <div className={`logo ${small ? "small" : ""}`}>
      <span>TALK</span>
      <small>MARISTA</small>
    </div>
  );
}

/** Cabeçalho das telas internas, com botão de voltar. 
 * @param title — texto principal do cabeçalho.
 * @param back — ação chamada pelo botão voltar.
 * @param action — elemento opcional exibido à direita do cabeçalho.
 */
export function Header({ title, back, action }: { title: string; back?: () => void; action?: ReactNode }) {
  return (
    <header className="header">
      {back ? <button className="icon-btn" onClick={back} aria-label="Voltar"><ArrowLeft /></button> : <span className="header-spacer" aria-hidden="true" />}
      <div><b>{title}</b><small>Talk Marista</small></div>
      <div className="header-right">{action}</div>
    </header>
  );
}

const TABS: { screen: Screen; icon: ReactNode; label: string }[] = [
  { screen: "home", icon: <Home />, label: "Início" },
  { screen: "reservations", icon: <CalendarDays />, label: "Reservas" },
  { screen: "communications", icon: <Bell />, label: "Avisos" },
  { screen: "account", icon: <CircleUserRound />, label: "Conta" },
];

/** Barra de navegação inferior (somente perfil morador). `active` destaca a aba atual. 
 * @param active — identifica a aba que deve aparecer selecionada.
 * @param nav — funções de navegação usadas ao trocar de aba.
 */
export function Bottom({ active, nav }: { active: Screen; nav: Nav }) {
  return (
    <nav className="bottom">
      {TABS.map((t) => (
        <button key={t.screen} className={active === t.screen ? "on" : ""} onClick={() => nav.tab(t.screen)}>
          {t.icon}<span>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}


/** Aviso persistente: sem nuvem, os dados ficam isolados neste navegador/aparelho.
 * Não recebe parâmetros; só é renderizado quando o Supabase não está configurado.
 */
export function LocalModeNotice() {
  if (cloudConfigured) return null;
  return (
    <aside className="local-mode-notice" role="status">
      <span className="local-mode-dot" />
      <div><b>Modo local ativo</b><small>Os dados ficam somente neste aparelho e não sincronizam com a portaria.</small></div>
    </aside>
  );
}

/** Janela sobreposta para formulários rápidos. 
 * @param title — título exibido na janela.
 * @param close — ação que fecha a janela.
 * @param children — conteúdo do formulário ou mensagem.
 */
export function Modal({ title, close, children }: { title: string; close: () => void; children: ReactNode }) {
  return (
    <div className="backdrop" onMouseDown={close}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <b>{title}</b>
          <button className="icon-btn" onClick={close} aria-label="Fechar"><X /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** Título de seção com ícone.
 * @param title — texto pequeno que identifica a seção.
 * @param subtitle — título principal da seção.
 * @param icon — elemento visual que acompanha o título.
 */
export function Section({ title, subtitle, icon }: { title: string; subtitle: string; icon: ReactNode }) {
  return (
    <div className="section">
      <div><small>{title}</small><h2>{subtitle}</h2></div>
      {icon}
    </div>
  );
}

/** Linha de lista: ícone (ou miniatura de foto), título, subtítulo e status opcional.
 * @param icon — ícone exibido quando não há miniatura.
 * @param thumb — endereço opcional da imagem em miniatura.
 * @param title — texto principal do registro.
 * @param sub — informação complementar do registro.
 * @param status — situação opcional exibida ao lado do registro.
 */
export function ListItem({ icon, thumb, title, sub, status, action }: {
  icon: ReactNode; thumb?: string; title: string; sub: string; status?: string; action?: ReactNode;
}) {
  return (
    <div className="record">
      {thumb ? <img className="thumb" src={thumb} alt="" /> : <div>{icon}</div>}
      <span><b>{title}</b><small>{sub}</small></span>
      {status && <em>{status}</em>}
      {action}
    </div>
  );
}

/** Mensagem de lista vazia.
 * @param text — orientação exibida quando não existem registros.
 */
export function Empty({ text }: { text: string }) {
  return <div className="empty"><Sparkles /><span>{text}</span></div>;
}

/** Cartão de atalho do painel do morador.
 * @param icon — ícone que representa a funcionalidade.
 * @param title — nome da funcionalidade.
 * @param sub — resumo da ação disponível.
 * @param onClick — ação executada ao selecionar o cartão.
 */
export function Action({ icon, title, sub, onClick }: { icon: ReactNode; title: string; sub: string; onClick: () => void }) {
  return (
    <button className="action" onClick={onClick}>
      <div>{icon}</div>
      <span><b>{title}</b><small>{sub}</small></span>
      <ChevronRight />
    </button>
  );
}

/** Grupo de opções em botões (uma escolha). Usado em tipo e tamanho da encomenda.
 * @param label — identificação do campo.
 * @param options — valores que podem ser escolhidos.
 * @param value — opção atualmente selecionada.
 * @param onChange — callback que recebe a nova opção.
 */
export function Chips<T extends string>({ label, options, value, onChange }: {
  label: string; options: readonly T[]; value: T | ""; onChange: (v: T) => void;
}) {
  return (
    <div className="field">
      <span>{label}</span>
      <div className="chips">
        {options.map((o) => (
          <button type="button" key={o} className={`chip ${value === o ? "on" : ""}`} onClick={() => onChange(o)}>{o}</button>
        ))}
      </div>
    </div>
  );
}

/** Tirar foto: abre a câmera no celular (ou o seletor de arquivos no computador). 
 * @param value — imagem atual em Data URL, quando já existe.
 * @param onChange — callback que recebe a imagem comprimida ou undefined ao removê-la.
 */
export function PhotoPicker({ value, onChange, label = "Foto da encomenda" }: { value?: string; onChange: (photo?: string) => void; label?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraBusy, setCameraBusy] = useState(false);

  useEffect(() => {
    if (!cameraOpen) return;
    let cancelled = false;
    setCameraBusy(true);
    setError("");
    const mediaDevices = navigator.mediaDevices;
    if (!mediaDevices?.getUserMedia) {
      setError("Este navegador não oferece acesso à webcam. Use a opção Escolher foto.");
      setCameraOpen(false);
      setCameraBusy(false);
      return;
    }
    mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false })
      .then((stream) => {
        if (cancelled) { stream.getTracks().forEach((track) => track.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) { videoRef.current.srcObject = stream; void videoRef.current.play().catch(() => undefined); }
      })
      .catch(() => {
        if (!cancelled) { setError("Não foi possível acessar a webcam. Verifique a permissão do navegador e tente usar a opção de arquivo."); setCameraOpen(false); }
      })
      .finally(() => { if (!cancelled) setCameraBusy(false); });
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [cameraOpen]);

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try { setError(""); onChange(await compressPhoto(file)); }
    catch (err) { setError(err instanceof Error ? err.message : "Falha ao processar a foto."); }
  };

  const capture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) { setError("A webcam ainda está iniciando. Aguarde um instante."); return; }
    const canvas = document.createElement("canvas");
    const scale = Math.min(1, 1280 / Math.max(video.videoWidth, video.videoHeight));
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    const context = canvas.getContext("2d");
    if (!context) { setError("Não foi possível preparar a imagem."); return; }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    onChange(canvas.toDataURL("image/jpeg", 0.78));
    setCameraOpen(false);
  };

  return (
    <div className="field">
      <span>{label}</span>
      <div className="photo-picker">
        {value ? <img src={value} alt={label} /> : <div className="photo-empty"><Camera /><small>Nenhuma foto</small></div>}
        <div className="photo-actions">
          <button type="button" className="photo-btn" onClick={() => setCameraOpen(true)}><Camera /> {value ? "Usar webcam" : "Abrir webcam"}</button>
          <button type="button" className="photo-btn ghost" onClick={() => inputRef.current?.click()}><Camera /> Escolher foto</button>
          {value && <button type="button" className="photo-btn ghost" onClick={() => onChange(undefined)}><Trash2 /> Remover</button>}
        </div>
        <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleFile} />
      </div>
      {cameraOpen && <div className="camera-panel">
        <video ref={videoRef} autoPlay playsInline muted aria-label="Prévia da webcam" />
        {cameraBusy && <small>Conectando à webcam...</small>}
        <div className="photo-actions"><button type="button" className="photo-btn" disabled={cameraBusy} onClick={capture}>Capturar foto</button><button type="button" className="photo-btn ghost" onClick={() => setCameraOpen(false)}>Cancelar</button></div>
      </div>}
      {error && <p className="error-note" role="alert">{error}</p>}
    </div>
  );
}

/** Navegação superior compartilhada das principais áreas do morador. */
const RESIDENT_TABS: { screen: Screen; label: string }[] = [
  { screen: "home", label: "Home" },
  { screen: "reservations", label: "Reservas" },
  { screen: "visitors", label: "Visitantes" },
  { screen: "workers", label: "Prestadores" },
  { screen: "packages", label: "Encomendas" },
];
export function ResidentTopTabs({ active, nav }: { active: Screen; nav: Nav }) {
  return <nav className="resident-top-tabs" aria-label="Navegação principal do morador">
    {RESIDENT_TABS.map(tab => <button key={tab.screen} type="button" className={active === tab.screen ? "on" : ""} aria-current={active === tab.screen ? "page" : undefined} onClick={() => nav.tab(tab.screen)}>{tab.label}</button>)}
  </nav>;
}
