# Talk Marista — atualização do primeiro acesso

## O que foi incluído
- Opção **Primeiro acesso? Criar cadastro** na tela de autenticação.
- Formulário com nome completo, e-mail, apartamento, senha e confirmação.
- Validação de campos obrigatórios, senha mínima de 8 caracteres e confirmação.
- Envio dos metadados `full_name`, `apartment` e `role: morador` para Supabase Auth.
- Mantida a autenticação por e-mail e senha.
- SQL de correção do gatilho `handle_new_user()` para não abortar a criação de uma conta Auth quando o Dashboard cria um usuário sem apartamento nos metadados. Nesse caso, nenhum perfil incompleto é criado.

## Antes de executar
1. Abra `supabase-config.js` e substitua `COLE_AQUI_SUA_CHAVE_SB_PUBLISHABLE` pela Publishable key do projeto `zzwtmbhguccwhkcuxoyk`.
2. Não use a chave `service_role`.
3. No SQL Editor do projeto `zzwtmbhguccwhkcuxoyk`, execute `CORRECAO-CADASTRO-SUPABASE.sql`.
4. Use a pasta atualizada para iniciar o servidor local.

## Observações importantes
- A constraint `profile_role_apartment_check` é mantida.
- O cadastro do aplicativo cria somente perfil de morador e envia o apartamento obrigatório.
- O SQL não cria perfil de Portaria a partir de metadados do navegador e não concede privilégios.
- Se a confirmação de e-mail estiver habilitada no Supabase, o morador deverá confirmar o e-mail antes de entrar.
- A aprovação pela Portaria depende da coluna/status e do fluxo de aprovação já configurados no banco. Esta atualização não remove nem altera essas políticas.
- Usuários Auth criados manualmente pelo Dashboard sem metadados de apartamento não recebem perfil automaticamente; isso evita a violação da constraint. Para cadastrar moradores, prefira o formulário do aplicativo.
