# Instalação da atualização Talk Marista 6.3.1

Esta atualização mantém as tabelas já existentes e usa os nomes confirmados no projeto: `profiles`, `apartments`, `residents`, `visitors`, `family_members`, `workers`, `packages`, `package_events`, `accesses`, `reservations`, `moves` e `service_requests`.

## 1. Antes de atualizar

- Faça um backup do projeto Supabase (Database → Backups).
- Não execute novamente o SQL de instalação inicial completo.
- Não apague tabelas nem usuários.

## 2. Aplicar as migrações

No Supabase, abra SQL Editor → New query. Execute, nesta ordem, o conteúdo de:

1. `supabase/migrations/202611180001_resident_registration.sql`
2. `supabase/migrations/202611180002_apartment_notifications.sql`
3. `supabase/migrations/202611180004_reapply_rls_policies.sql`
4. `supabase/migrations/202611180003_app_data_compatibility.sql`

**Atenção à ordem:** a migração 004 cria as funções `is_portaria()` e `current_user_apartment()`, utilizadas pelas políticas de acesso às fotos na migração 003. Por isso, a 004 deve ser executada antes da 003, mesmo que seu número de arquivo seja maior. A migração 004 reaplica as regras RLS de morador e Portaria para o conjunto de tabelas do condomínio. As migrações são incrementais: criam a fila de aprovação, as notificações, as políticas de acesso, a coluna opcional de foto e o histórico de eventos de encomendas. A segunda migração usa `accesses` (nome real da tabela) e `worker_type` (nome real da coluna).

A referência `public.apartments(number)` foi conferida no banco: `number` é `text`, `NOT NULL` e chave primária.

## 3. Publicar as funções de aprovação

As funções de cadastro e revisão precisam estar publicadas no Supabase Edge Functions:

- `resident-register`
- `resident-review`

Se usar Supabase CLI, na pasta do projeto execute:

```bash
supabase login
supabase link --project-ref zzwtmbhguccwhkcuxoyk
supabase functions deploy resident-register
supabase functions deploy resident-review
```

Configure o segredo `SUPABASE_SERVICE_ROLE_KEY` nas Edge Functions pelo painel/CLI do Supabase. Ele é segredo de servidor: nunca coloque essa chave em `supabase-config.js`, `.env` do frontend ou no ZIP.

## 4. Configurar a chave pública no app

Edite `public/supabase-config.js` e informe a URL do projeto e a chave `sb_publishable_...` (ou a chave anon pública legada). Não use `service_role`.

## 5. Permissões (RLS)

O esquema inicial do Talk Marista já cria políticas RLS para os dados do condomínio. As regras esperadas são:

- Morador: consultar somente registros do próprio apartamento; cadastrar seus visitantes, familiares, prestadores, reservas e mudanças.
- Portaria: consultar os registros de todos os apartamentos; cadastrar encomendas e acessos; administrar moradores e revisar mudanças.
- Fotos de encomendas: bucket privado; Portaria envia e usuários autenticados do apartamento correspondente visualizam.
- Solicitações de novo cadastro: a fila é consultada/revisada pela Portaria; criação e revisão são feitas pelas Edge Functions.

Não desative RLS para resolver erros. Se aparecer `permission denied` ou `row-level security`, revise as policies no Supabase antes de liberar o uso.

## 6. Teste de aceitação

Use uma conta de morador e a conta de Portaria já existentes:

1. Morador cadastra visitante, familiar, prestador, reserva e mudança.
2. Atualize a página e entre novamente: os registros devem continuar lá.
3. Portaria registra encomenda, registra retirada e libera um visitante.
4. Atualize a página e entre novamente: os registros devem continuar lá.
5. Faça um cadastro de morador com uma conta de teste; ele deve aparecer em Portaria → Cadastros. Aprove e confirme que o perfil aparece em `profiles`.

O ZIP contém o código e as migrações, mas a publicação das Edge Functions e a aplicação das migrações no seu projeto Supabase são etapas externas que precisam ser feitas no painel/CLI. A integração não deve ser considerada validada em produção até concluir os testes acima.
