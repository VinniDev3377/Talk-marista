-- Schema do Talk Marista.
-- ATENÇÃO: as tabelas base (profiles, packages, visitors, family_members, workers,
-- reservations, service_requests, communications, access_logs) e as políticas do V4
-- NÃO estão neste arquivo. Execute-os antes deste.


-- ============================================================
-- V5 — POLÍTICAS OPERACIONAIS E PERFORMANCE
-- ============================================================

-- Função auxiliar: retorna o papel do usuário autenticado para uso nas regras de acesso.
create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

-- Políticas para equipes operacionais e administradores.
-- Política RLS: limita a operação conforme o perfil retornado por current_role().
create policy "admin all family v5" on public.family_members
for all using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');

-- Política RLS: limita a operação conforme o perfil retornado por current_role().
create policy "admin all workers v5" on public.workers
for all using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');

-- Política RLS: limita a operação conforme o perfil retornado por current_role().
create policy "admin all reservations v5" on public.reservations
for all using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');

-- Política RLS: limita a operação conforme o perfil retornado por current_role().
create policy "admin all services v5" on public.service_requests
for all using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');

-- Política RLS: limita a operação conforme o perfil retornado por current_role().
create policy "staff read workers v5" on public.workers
for select using (public.current_role() in ('portaria','admin'));

-- Política RLS: limita a operação conforme o perfil retornado por current_role().
create policy "staff read reservations v5" on public.reservations
for select using (public.current_role() in ('portaria','admin'));

-- Política RLS: limita a operação conforme o perfil retornado por current_role().
create policy "staff read services v5" on public.service_requests
for select using (public.current_role() in ('portaria','admin'));

-- Política RLS: limita a operação conforme o perfil retornado por current_role().
create policy "staff update services v5" on public.service_requests
for update using (public.current_role() in ('portaria','admin'))
with check (public.current_role() in ('portaria','admin'));

-- Índices para acelerar portaria e consultas por apartamento.
-- Índice: acelera filtros frequentes por apartamento e data/hora.
create index if not exists idx_packages_apartment_received
  on public.packages(apartment, received_at desc);

-- Índice: acelera filtros frequentes por apartamento e data/hora.
create index if not exists idx_visitors_apartment_date
  on public.visitors(apartment, visit_date desc);

-- Índice: acelera filtros frequentes por apartamento e data/hora.
create index if not exists idx_access_logs_apartment_time
  on public.access_logs(apartment, occurred_at desc);

-- Índice: acelera filtros frequentes por apartamento e data/hora.
create index if not exists idx_service_requests_apartment_created
  on public.service_requests(apartment, created_at desc);

-- Validação dos apartamentos permitidos.
-- Aceita somente 301-304, 401-404 ... 2401-2404 (andar + unidade 01 a 04).
-- Validador de unidade. Parâmetro a: número do apartamento em texto; retorno: formato permitido ou não.
create or replace function public.valid_apartment(a text)
returns boolean
language sql
immutable
as $$
  select a ~ '^([3-9]|1[0-9]|2[0-4])0[1-4]$'
$$;


-- ============================================================
-- V6 — ENCOMENDAS COM FOTO, TIPO E TAMANHO (cadastro só pela portaria)
-- ============================================================

-- Amplia a tabela de encomendas com destinatário, classificação, tamanho e caminho da foto.
alter table public.packages
  add column if not exists recipient  text,
  add column if not exists kind       text check (kind in ('Caixa','Embalagem','Pacote')),
  add column if not exists size       text check (size in ('Extra pequeno','Pequeno','Médio','Grande','Extra grande')),
  add column if not exists photo_path text;

-- Somente a portaria cadastra encomendas.
-- Se o V4 criou uma política que permite moradores/admin inserirem em `packages`,
-- remova-a: políticas permissivas se somam, e esta não restringe sozinha.
-- Política RLS: limita a operação conforme o perfil retornado por current_role().
create policy "portaria insert packages v6" on public.packages
for insert with check (public.current_role() = 'portaria');

-- Bucket privado das fotos (as fotos ficam em <apartamento>/<arquivo>.jpg).
-- Bucket privado: armazena fotos de encomendas sem disponibilizá-las publicamente.
insert into storage.buckets (id, name, public)
values ('package-photos', 'package-photos', false)
on conflict (id) do nothing;

-- Somente a portaria envia fotos.
-- Política RLS: limita a operação conforme o perfil retornado por current_role().
create policy "portaria upload package photos v6" on storage.objects
for insert to authenticated
with check (bucket_id = 'package-photos' and public.current_role() = 'portaria');

-- Portaria e admin veem todas as fotos; o morador vê só as do seu apartamento.
-- Política RLS: limita a operação conforme o perfil retornado por current_role().
create policy "read package photos v6" on storage.objects
for select to authenticated
using (
  bucket_id = 'package-photos'
  and (
    public.current_role() in ('portaria','admin')
    or (storage.foldername(name))[1] = (select apartment from public.profiles where id = auth.uid())
  )
);
