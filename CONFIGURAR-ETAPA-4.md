# Talk Marista — Etapa 4: cadastro e aprovação de moradores

## Fluxo implementado no código

1. Morador informa nome completo, apartamento e cria senha com no mínimo 8 caracteres.
2. A tela chama a Edge Function `resident-register`. A senha é enviada diretamente ao Auth Admin e não é gravada na tabela de solicitações.
3. A conta é criada sem perfil ativo e a solicitação entra como `pending`.
4. O painel da Portaria exibe a aba **Cadastros** com os pedidos pendentes.
5. Ao aprovar, a Edge Function valida a sessão e o papel `portaria`, cria `profiles` com papel `morador` e marca a solicitação como aprovada.
6. Ao recusar, a solicitação é marcada como recusada e a conta continua sem perfil; portanto, não consegue entrar no aplicativo.
7. O login do morador usa nome completo + apartamento + senha. O sistema deriva internamente um identificador técnico de Auth; o morador não precisa conhecer nem informar esse identificador.

## Pré-requisitos no Supabase

- A tabela `apartments` deve conter os apartamentos 301–2404.
- A tabela `profiles` deve existir com `id`, `full_name`, `apartment` e `role`.
- O projeto precisa permitir que a Portaria já cadastrada faça login normalmente.
- Configure as secrets das Edge Functions no painel/CLI: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` e, opcionalmente, `APP_ORIGIN`.
- A chave `SUPABASE_SERVICE_ROLE_KEY` fica somente nas secrets do servidor; nunca coloque no `.env` do frontend nem no Netlify.

## Instalação controlada

1. Faça backup do projeto Supabase.
2. Revise `supabase/migrations/202611180001_resident_registration.sql` antes de executar. Ela cria a fila e substitui a função legada `public.handle_new_user()` para impedir perfil automático de novas contas. Isso precisa ser compatível com o trigger existente no seu projeto.
3. Publique as Edge Functions `resident-register` e `resident-review`.
4. Configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no ambiente de build do frontend.
5. Faça build e teste primeiro em um ambiente de homologação, com uma conta de Portaria e um apartamento de teste.

## Observações importantes

- Não execute a migração antes de confirmar o código atual de `handle_new_user()` e o nome do trigger no banco. O arquivo é uma proposta de migração revisável, não foi executado.
- Não habilite cadastro livre no frontend sem publicar as Edge Functions.
- O domínio de e-mail técnico `talkmarista.invalid` é interno e não recebe e-mails; as contas são criadas pela Edge Function com confirmação administrativa. Não usar confirmação por e-mail para esse fluxo.
- A lista de solicitações só pode ser lida por usuário cujo `profiles.role` seja `portaria`. A decisão final é validada novamente no servidor.
- Ainda é necessário configurar proteção contra abuso/rate limiting e testar concorrência, recuperação de senha e troca de nome.
- O site público e o banco atual não foram alterados por este pacote.
