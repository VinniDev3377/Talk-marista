# Talk Marista — Etapa 5 (incremental)

Esta etapa parte do código editável da Etapa 4. As alterações são incrementais e não removem telas, coleções locais, fluxos de login ou a migração de aprovação de moradores.

## O que foi acrescentado

- **Portaria / Moradores:** grade de apartamentos no tema azul e dourado. Os cartões mostram somente o número da unidade; ao abrir, a janela organiza moradores, familiares, funcionários/prestadores e visitantes em listas separadas.
- **Portaria / navegação:** o cabeçalho da Portaria não exibe mais o botão de voltar. A saída permanece no botão inferior “Sair da portaria”.
- **Portaria / Resumo:** a aba foi renomeada para “Resumo” e o painel recebeu um indicador adicional de equipe ativa, mantendo os indicadores existentes.
- **Encomendas / webcam:** o seletor de foto agora oferece captura direta pela webcam em navegadores compatíveis, além da seleção de arquivo. O fluxo encerra a câmera ao fechar/capturar e mostra alternativa se o navegador negar acesso.
- **Computador:** conteúdo interno usa largura responsiva maior em monitores amplos, com limite máximo para evitar esticamento exagerado.
- **Notificações:** tela de Comunicados preparada para consultar notificações pessoais no Supabase, com atualização em tempo real e marcação individual como lida. A migração SQL cria a tabela, as políticas e os gatilhos de banco.
- **Configuração Supabase:** o cliente agora aceita a configuração pública legada `public/supabase-config.js` ou as variáveis `.env.local`.

## Importante: limite de integração desta etapa

Os módulos de visitantes, familiares, funcionários/prestadores, encomendas e acessos da reconstrução editável ainda mantêm operações locais no estado do navegador. A migração de notificações gera alertas quando os registros são inseridos/atualizados nas tabelas Supabase correspondentes, mas não transforma por si só os formulários locais em gravações na nuvem. Para sincronização real entre aparelhos, esses formulários e o carregamento inicial precisam ser ligados às funções de `src/cloud/api.ts` em uma etapa de integração/testes com o projeto Supabase existente.

Não executar a migração de notificações antes de confirmar que as tabelas-base `profiles`, `apartments`, `packages`, `visitors`, `workers`, `family_members` e `access_logs` existem no projeto. A migração instala gatilhos apenas nas tabelas encontradas e não apaga dados existentes.

## Configuração

1. Abra `public/supabase-config.js`.
2. Informe a URL do projeto Supabase e a chave pública `sb_publishable_...`.
3. Nunca use `service_role`, senha ou PIN no navegador.
4. No Supabase SQL Editor, revise e execute `supabase/migrations/202611180002_apartment_notifications.sql` após conferir os pré-requisitos acima.
5. Instale as dependências e valide a compilação:

   ```bash
   npm install
   npm run typecheck
   npm run build
   ```

6. Teste em `localhost` ou HTTPS. A webcam exige contexto seguro e autorização do navegador. Se não houver suporte, use “Escolher foto”.

## Testes pendentes neste pacote

A instalação de dependências não pôde ser concluída no ambiente de preparação por indisponibilidade/timeout do registro npm. Por isso, a compilação TypeScript/Vite e os testes integrados com Supabase e webcam ainda precisam ser executados no computador de desenvolvimento antes de substituir o aplicativo em uso.
