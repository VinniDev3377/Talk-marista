-- Habilita eventos Postgres Changes nas tabelas usadas pelo Talk Marista.
-- O Realtime continua respeitando as políticas RLS de cada tabela.
do $$
declare table_name text;
begin
  foreach table_name in array array[
    'apartments','profiles','residents','visitors','family_members','workers',
    'packages','package_events','accesses','reservations','moves',
    'service_requests','resident_registration_requests','apartment_notifications'
  ]
  loop
    if to_regclass('public.' || table_name) is not null
      and not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = table_name
      )
    then execute format('alter publication supabase_realtime add table public.%I', table_name);
    end if;
  end loop;
end $$;

-- Checagem anterior confirmou que não existem registros vinculados a estas unidades.
delete from public.apartments where number in ('301','302','303','304');
