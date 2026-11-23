
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Cabeçalhos compartilhados do projeto.
const corsHeaders = {
  "Access-Control-Allow-Origin":
  "https://talk-marista-app.vercel.app",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

const slug = (value: string) =>
  value.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Método não permitido." }, 405);
  }

  try {
    const { fullName, apartment, password } = await req.json();

    if (
      typeof fullName !== "string" ||
      fullName.trim().split(/\s+/).length < 2
    ) {
      return json({ error: "Informe nome e sobrenome." }, 400);
    }

    if (
      typeof apartment !== "string" ||
      !/^([4-9]|1[0-9]|2[0-4])0[1-4]$/.test(apartment)
    ) {
      return json({ error: "Apartamento inválido." }, 400);
    }

    if (typeof password !== "string" || password.length < 8) {
      return json({
        error: "A senha precisa ter pelo menos 8 caracteres."
      }, 400);
    }

    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const admin = createClient(url, serviceKey, {
      auth: { persistSession: false },
    });

    const email =
      `morador-${apartment}-${slug(fullName)}@talkmarista.invalid`;

    const { data: existing } = await admin
      .from("resident_registration_requests")
      .select("id,status")
      .eq("apartment", apartment)
      .ilike("full_name", fullName.trim())
      .in("status", ["pending", "approved"])
      .maybeSingle();

    if (existing) {
      return json({
        error: existing.status === "pending"
          ? "Já existe um cadastro aguardando aprovação para esses dados."
          : "Esse morador já possui cadastro."
      }, 409);
    }

    const { data: created, error: createError } =
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName.trim(),
          apartment,
          registration_pending: true,
        },
      });

    if (createError || !created.user) {
      return json({
        error: createError?.message ?? "Não foi possível criar a conta."
      }, 400);
    }

    const { error: requestError } = await admin
      .from("resident_registration_requests")
      .insert({
        auth_user_id: created.user.id,
        full_name: fullName.trim(),
        apartment,
        status: "pending",
      });

    if (requestError) {
      await admin.auth.admin.deleteUser(created.user.id);
      return json({ error: requestError.message }, 400);
    }

    return json({
      message: "Cadastro enviado. Aguarde a aprovação da Portaria."
    }, 201);

  } catch (_error) {
    return json({
      error: "Não foi possível processar o cadastro."
    }, 500);
  }
});
