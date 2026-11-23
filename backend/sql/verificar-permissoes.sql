-- CONSULTA SOMENTE DE LEITURA: mostra RLS e policies do Talk Marista.
-- Não cria, altera ou exclui dados.
select
  t.tablename,
  t.rowsecurity as rls_ativo,
  p.policyname,
  p.cmd as operacao,
  p.roles,
  p.qual as regra_leitura_uso,
  p.with_check as regra_gravacao
from pg_tables t
left join pg_policies p
  on p.schemaname = t.schemaname
 and p.tablename = t.tablename
where t.schemaname = 'public'
  and t.tablename in (
    'profiles','apartments','residents','visitors','family_members','workers',
    'packages','package_events','accesses','reservations','moves',
    'service_requests','resident_registration_requests','apartment_notifications'
  )
order by t.tablename, p.policyname;
