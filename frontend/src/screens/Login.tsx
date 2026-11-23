import { useState, type FormEvent } from "react";
import { Building2, KeyRound, LogIn, Mail, UserCog, UserRound, UserPlus, ArrowLeft, ShieldCheck } from "lucide-react";
import { APARTMENTS, BUILDING_IMAGE, DEMO_ACCOUNTS, ROLE_OPTIONS } from "../constants";
import { Logo } from "../components/ui";
import { cloudConfigured, getCurrentProfile, residentLoginEmail, submitResidentRegistration, useAuth } from "../cloud";
import type { Role, SessionUser } from "../types";

type AccessTab = "login" | "register";

/** Tela de acesso. O cadastro reaproveita a mesma foto e identidade visual da abertura. */
export function Login({ enter }: { enter: (user: SessionUser) => void }) {
  const auth = useAuth();
  const [tab, setTab] = useState<AccessTab>("login");
  const [role, setRole] = useState<Role | "">("");
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [apartment, setApartment] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [newApartment, setNewApartment] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const changeTab = (next: AccessTab) => { setTab(next); setError(""); setNotice(""); };

  /** Autentica pela configuração atual do Supabase; perfil ausente significa cadastro não aprovado. */
  const signInCloud = async () => {
    if (!role) throw new Error("Selecione o perfil de acesso.");
    const loginEmail = role === "morador" ? residentLoginEmail(userId, apartment) : email.trim().toLowerCase();
    if (role === "morador" && (!userId.trim() || !apartment)) throw new Error("Informe seu nome completo e apartamento.");
    await auth.signIn(loginEmail, password);
    const profile = await getCurrentProfile();
    if (!profile) { await auth.signOut(); throw new Error("Cadastro ainda não aprovado pela Portaria ou perfil não encontrado."); }
    if (profile.role === "morador" && profile.apartment !== apartment) {
      await auth.signOut(); throw new Error("O apartamento informado não corresponde ao cadastro.");
    }
    enter({ name: profile.full_name, apartment: profile.apartment ?? "", role: profile.role });
  };

  /** Login demonstrativo para exploração local, sem representar cadastro real de morador. */
  const signInDemo = () => {
    const account = DEMO_ACCOUNTS[userId.trim().toLowerCase()];
    if (!role || !account || account.password !== password || account.role !== role) throw new Error("Perfil, usuário ou senha incorretos.");
    if (role === "morador" && !apartment) throw new Error("Selecione o apartamento.");
    enter({ name: account.name, apartment: role === "morador" ? apartment : "", role });
  };

  const submitLogin = async (e: FormEvent) => {
    e.preventDefault(); setError(""); setNotice(""); setBusy(true);
    try { if (cloudConfigured) await signInCloud(); else signInDemo(); }
    catch (err) { setError(err instanceof Error ? err.message : "Não foi possível entrar."); }
    finally { setBusy(false); }
  };

  /** Valida e envia o pedido à Edge Function; a senha nunca é gravada em tabela pública. */
  const submitRegistration = async (e: FormEvent) => {
    e.preventDefault(); setError(""); setNotice("");
    if (fullName.trim().split(/\s+/).length < 2) return setError("Informe seu nome e sobrenome.");
    if (!APARTMENTS.includes(newApartment)) return setError("Selecione um apartamento válido.");
    if (newPassword.length < 8) return setError("Crie uma senha com pelo menos 8 caracteres.");
    if (newPassword !== confirmPassword) return setError("As senhas não coincidem.");
    if (!cloudConfigured) return setError("O cadastro online ainda não está configurado. Tente novamente quando a conexão segura estiver ativa.");
    setBusy(true);
    try {
      await submitResidentRegistration({ fullName: fullName.trim().replace(/\s+/g, " "), apartment: newApartment, password: newPassword });
      setNotice("Cadastro enviado com sucesso. Aguarde a aprovação da Portaria para entrar no aplicativo.");
      setFullName(""); setNewApartment(""); setNewPassword(""); setConfirmPassword("");
    } catch (err) { setError(err instanceof Error ? err.message : "Não foi possível enviar o cadastro."); }
    finally { setBusy(false); }
  };

  return (
    <div className="screen photo-screen" style={{ backgroundImage: `url(${BUILDING_IMAGE})` }}>
      <div className="veil strong" />
      <div className="login login-access">
        <Logo />
        <div className="access-tabs" role="tablist" aria-label="Tipo de acesso">
          <button type="button" role="tab" aria-selected={tab === "login"} className={tab === "login" ? "active" : ""} onClick={() => changeTab("login")}><LogIn size={16}/> Entrar</button>
          <button type="button" role="tab" aria-selected={tab === "register"} className={tab === "register" ? "active" : ""} onClick={() => changeTab("register")}><UserPlus size={16}/> Primeiro acesso</button>
        </div>
        {tab === "login" ? (
          <form onSubmit={submitLogin} autoComplete="off">
            <h2 className="access-title">Bem-vindo de volta!</h2><p className="center muted">Faça login para continuar</p>
            {!cloudConfigured && <p className="mode-note"><span /> MODO LOCAL · dados salvos somente neste aparelho</p>}
            <label><UserCog/><select value={role} onChange={e => setRole(e.target.value as Role | "")} required><option value="">Selecione o perfil</option>{ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}</select></label>
            {role === "morador" ? <>
              <label><UserRound/><input value={userId} onChange={e => setUserId(e.target.value)} placeholder="Nome completo cadastrado" autoComplete="username" required/></label>
              <label><Building2/><select value={apartment} onChange={e => setApartment(e.target.value)} required><option value="">Selecione o apartamento</option>{APARTMENTS.map(a => <option key={a}>{a}</option>)}</select></label>
            </> : role === "portaria" ? <label><Mail/><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="E-mail da Portaria" autoComplete="username" required/></label> : null}
            <label><KeyRound/><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Senha" autoComplete="current-password" required/></label>
            {error && <p className="error-note" role="alert">{error}</p>}
            <button className="primary" type="submit" disabled={busy}><LogIn/> ENTRAR</button>
            <p className="center muted note">Primeiro acesso? Selecione a aba acima para criar sua conta.</p>
          </form>
        ) : (
          <form onSubmit={submitRegistration} autoComplete="off">
            <h2 className="access-title">Cadastro de morador</h2><p className="center muted">Crie seu acesso pessoal ao condomínio</p>
            <div className="approval-hint"><ShieldCheck size={18}/><span>O cadastro será analisado e aprovado pela Portaria antes da liberação do acesso.</span></div>
            <label><UserRound/><input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Nome completo do morador" autoComplete="name" required/></label>
            <label><Building2/><select value={newApartment} onChange={e => setNewApartment(e.target.value)} required><option value="">Selecione seu apartamento</option>{APARTMENTS.map(a => <option key={a} value={a}>{a}</option>)}</select></label>
            <label><KeyRound/><input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Crie sua senha (mín. 8 caracteres)" autoComplete="new-password" minLength={8} required/></label>
            <label><KeyRound/><input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirme sua senha" autoComplete="new-password" minLength={8} required/></label>
            {error && <p className="error-note" role="alert">{error}</p>}{notice && <p className="registration-notice" role="status">{notice}</p>}
            <button className="primary" type="submit" disabled={busy}><UserPlus/> {busy ? "ENVIANDO..." : "ENVIAR PARA APROVAÇÃO"}</button>
            <button className="back-login" type="button" onClick={() => changeTab("login")}><ArrowLeft size={15}/> Voltar para entrar</button>
          </form>
        )}
      </div>
    </div>
  );
}
