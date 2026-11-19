import { useEffect, useState, type ReactNode } from "react";
import { ChevronRight, CircleUserRound, FileText, KeyRound, ShieldCheck, Users } from "lucide-react";
import { Bottom, Logo, PhotoPicker } from "../components/ui";\nimport { supabase, managePortariaUsers } from "../cloud";
import type { Screen, ScreenProps } from "../types";

function ProfilePhotoEditor() {
  const [userId, setUserId] = useState("");
  const [photo, setPhoto] = useState<string>();
  const [current, setCurrent] = useState<string>();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    void (async () => {
      if (!supabase) return;
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;
      const { data } = await supabase.from("profiles").select("avatar_path").eq("id", auth.user.id).maybeSingle();
      if (!active) return;
      setUserId(auth.user.id);
      if (data?.avatar_path) {
        const { data: signed } = await supabase.storage.from("profile-photos").createSignedUrl(data.avatar_path, 3600);
        if (active) setCurrent(signed?.signedUrl);
      }
    })().catch(err => { if (active) setError(err instanceof Error ? err.message : "Não foi possível carregar a foto."); });
    return () => { active = false; };
  }, []);
  const save = async () => {
    if (!photo || !userId) return;
    setBusy(true); setError("");
    try {
      const result = await managePortariaUsers({ action: "update-avatar", userId, photo });
      setCurrent(result.avatar_url);
      setPhoto(undefined);
    } catch (err) { setError(err instanceof Error ? err.message : "Não foi possível salvar a foto."); }
    finally { setBusy(false); }
  };
  return <section className="profile-photo-editor">
    {current && <img src={current} alt="Foto atual do perfil" />}
    <PhotoPicker label="Sua foto de perfil" value={photo} onChange={setPhoto} />
    {error && <p className="error-note" role="alert">{error}</p>}
    {photo && <button className="primary" disabled={busy} onClick={save}>{busy ? "SALVANDO..." : "SALVAR FOTO DO PERFIL"}</button>}
  </section>;
}

const LINKS: { icon: ReactNode; title: string; screen: Screen }[] = [
  { icon: <Users />, title: "Familiares", screen: "family" },
  { icon: <ShieldCheck />, title: "Funcionários e prestadores", screen: "workers" },
  { icon: <KeyRound />, title: "Visitantes", screen: "visitors" },
  { icon: <FileText />, title: "Documentos", screen: "documents" },
];

/** Conta do morador: dados básicos, atalhos e sair. 
 * @param s — dados do perfil e estado do aplicativo.
 * @param nav — comandos de navegação.
 * @param onLogout — ação para encerrar a sessão.
 */
export function Account({ s, nav, onLogout }: Pick<ScreenProps, "s" | "nav"> & { onLogout: () => void }) {
  return (
    <div className="screen app">
      <div className="top"><Logo small /></div>
      <main className="content">
        <div className="profile">
          <div><CircleUserRound /></div>
          <span><b>{s.userName}</b><small>Apartamento {s.apartment}</small></span>
        </div>
        {LINKS.map((l) => (
          <button className="account-row" key={l.screen} onClick={() => nav.go(l.screen)}>
            {l.icon}<span>{l.title}</span><ChevronRight />
          </button>
        ))}
        <button className="danger" onClick={onLogout}>Sair da conta</button>
      </main>
      <Bottom active="account" nav={nav} />
    </div>
  );
}
