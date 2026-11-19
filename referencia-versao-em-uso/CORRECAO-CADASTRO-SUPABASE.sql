-- Talk Marista | Correção segura do cadastro pelo Supabase Auth
-- Projeto: zzwtmbhguccwhkcuxoyk
-- Execute no SQL Editor do projeto correto.
-- Não remove usuários, tabelas, políticas ou constraints existentes.
-- Se o usuário for criado pelo Dashboard sem apartamento nos metadados,
-- o Auth será criado normalmente e o perfil será aguardado até o cadastro
-- pelo formulário do aplicativo (que envia nome e apartamento).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_full_name text;
  v_apartment text;
begin
  v_full_name := coalesce(
    nullif(btrim(new.raw_user_meta_data->>'full_name'), ''),
    split_part(coalesce(new.email, ''), '@', 1)
  );
  v_apartment := nullif(btrim(new.raw_user_meta_data->>'apartment'), '');

  -- Morador sem apartamento não pode receber perfil: respeita a constraint.
  -- A conta Auth não falha; o cadastro completo deve ser feito no app.
  if v_apartment is null then
    return new;
  end if;

  insert into public.profiles (id, full_name, apartment, role)
  values (new.id, v_full_name, v_apartment, 'morador')
  on conflict (id) do nothing;

  return new;
end;
$function$;

-- O gatilho existente on_auth_user_created permanece ativo e continua
-- chamando public.handle_new_user().
