import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("APP_ORIGIN") ?? "https://talk-marista-app.vercel.app",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { ...corsHeaders, "Content-Type": "application/json" },
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método não permitido." }, 405);

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !serviceKey || !anonKey) return json({ error: "Configuração segura do servidor incompleta." }, 500);

  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "Sessão não autenticada." }, 401);

  const callerClient = createClient(url, anonKey, { global: { headers: { Authorization: `Bearer ${token}` } } });
  const { data: callerData, error: callerError } = await callerClient.auth.getUser(token);
  if (callerError || !callerData.user) return json({ error: "Sessão inválida." }, 401);

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: callerProfile, error: profileError } = await admin.from("profiles")
    .select("id,role").eq("id", callerData.user.id).maybeSingle();
  if (profileError || callerProfile?.role !== "portaria") return json({ error: "Apenas a Portaria pode administrar contas." }, 403);

  try {
    const body = await req.json();
    const action = String(body.action ?? "");

    if (action === "update-avatar") {
      const userId = String(body.userId ?? "");
      if (!userId || (!isPortaria && userId !== callerData.user.id)) return json({ error: "Sem permissão para alterar esta foto." }, 403);
      const photo = String(body.photo ?? "");
      const match = photo.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
      if (!match) return json({ error: "Selecione uma foto válida." }, 400);
      const bytes = Uint8Array.from(atob(match[2]), (char) => char.charCodeAt(0));
      const extension = match[1] === "image/png" ? "png" : match[1] === "image/webp" ? "webp" : "jpg";
      const path = `${userId}/avatar.${extension}`;
      const { error: uploadError } = await admin.storage.from("profile-photos").upload(path, bytes, { contentType: match[1], upsert: true });
      if (uploadError) throw uploadError;
      const { error: updateError } = await admin.from("profiles").update({ avatar_path: path }).eq("id", userId);
      if (updateError) throw updateError;
      const { data: signed } = await admin.storage.from("profile-photos").createSignedUrl(path, 3600);
      return json({ success: true, avatar_url: signed?.signedUrl ?? null });
    }

    if (action === "list") {
      const { data, error } = await admin.from("profiles")
        .select("id,full_name,apartment,role,avatar_path,created_at")
        .in("role", ["morador", "portaria"]).order("full_name");
      if (error) throw error;
      const rows = await Promise.all((data ?? []).map(async (row) => {
        if (!row.avatar_path) return { ...row, avatar_url: null };
        const { data: signed } = await admin.storage.from("profile-photos").createSignedUrl(row.avatar_path, 3600);
        return { ...row, avatar_url: signed?.signedUrl ?? null };
      }));
      return json({ users: rows });
    }

    if (action === "create") {
      const fullName = String(body.fullName ?? "").trim().replace(/\s+/g, " ");
      const role = String(body.role ?? "");
      const apartment = role === "morador" ? String(body.apartment ?? "") : null;
      const password = String(body.password ?? "");
      let email = String(body.email ?? "").trim().toLowerCase();
      if (fullName.split(/\s+/).length < 2 || !["morador", "portaria"].includes(role) || password.length < 8) {
        return json({ error: "Informe nome completo, perfil válido e senha com pelo menos 8 caracteres." }, 400);
      }
      if (role === "morador" && !/^([3-9]|1[0-9]|2[0-4])0[1-4]$/.test(apartment ?? "")) return json({ error: "Apartamento inválido." }, 400);
      if (role === "portaria" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "Informe um e-mail válido para a Portaria." }, 400);
      if (role === "morador") {
        const slug = fullName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        email = `morador-${apartment}-${slug}@talkmarista.invalid`;
      }
      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email, password, email_confirm: true, user_metadata: { full_name: fullName, apartment, role },
      });
      if (createError || !created.user) throw createError ?? new Error("Não foi possível criar a conta.");
      const { error: insertError } = await admin.from("profiles").insert({
        id: created.user.id, full_name: fullName, apartment, role,
      });
      if (insertError) {
        await admin.auth.admin.deleteUser(created.user.id);
        throw insertError;
      }
      let avatarPath: string | null = null;
      if (typeof body.photo === "string" && body.photo.startsWith("data:image/")) {
        const match = body.photo.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
        if (!match) {
          await admin.auth.admin.deleteUser(created.user.id);
          return json({ error: "Formato de foto inválido." }, 400);
        }
        const bytes = Uint8Array.from(atob(match[2]), (char) => char.charCodeAt(0));
        avatarPath = `${created.user.id}/avatar.${match[1] === "image/png" ? "png" : match[1] === "image/webp" ? "webp" : "jpg"}`;
        const { error: uploadError } = await admin.storage.from("profile-photos")
          .upload(avatarPath, bytes, { contentType: match[1], upsert: true });
        if (uploadError) {
          await admin.auth.admin.deleteUser(created.user.id);
          throw uploadError;
        }
        await admin.from("profiles").update({ avatar_path: avatarPath }).eq("id", created.user.id);
      }
      return json({ success: true, id: created.user.id, fullName, apartment, role, email, avatarPath });
    }

    if (action === "delete") {
      const userId = String(body.userId ?? "");
      if (!userId || userId === callerData.user.id) return json({ error: "Não é permitido excluir a própria conta da Portaria." }, 400);
      const { data: target, error: targetError } = await admin.from("profiles").select("id,role").eq("id", userId).maybeSingle();
      if (targetError || !target || !["morador", "portaria"].includes(target.role)) return json({ error: "Cadastro não encontrado." }, 404);
      const { error } = await admin.auth.admin.deleteUser(userId);
      if (error) throw error;
      return json({ success: true });
    }

    return json({ error: "Ação não reconhecida." }, 400);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Falha ao administrar cadastro." }, 400);
  }
});
