# Talk Marista 6.3.1

Aplicativo web do condomínio Talk Marista, desenvolvido com React, TypeScript e Vite, integrado ao Supabase para autenticação, dados e atualizações em tempo real.

## Requisitos
- Node.js LTS (20 ou versão compatível com o projeto)
- Visual Studio Code
- Git (opcional, para versionar alterações localmente)

## Abrir e executar no VS Code
1. Extraia o ZIP em uma pasta do computador.
2. No VS Code, use Arquivo → Abrir Pasta e selecione a pasta extraída.
3. Abra Terminal → Novo Terminal.
4. Instale as dependências executando: **npm install**.
5. Inicie o aplicativo executando: **npm run dev**.
6. Abra no navegador o endereço local exibido pelo Vite (normalmente http://localhost:5173).

Para testar em outro aparelho na mesma rede, execute **npm run dev:ios**. O terminal mostrará o endereço de rede para abrir no celular.

## Verificar antes de publicar
Execute **npm run build**. O comando verifica os tipos TypeScript e gera a versão de produção na pasta dist/.

## Estrutura principal
- src/App.tsx — navegação, sessão e integração dos módulos.
- src/main.tsx — inicialização do React.
- src/types.ts — tipos compartilhados do aplicativo.
- src/constants.ts — apartamentos e opções fixas.
- src/storage.ts — estado local e dados de demonstração.
- src/cloud/ — cliente, autenticação e operações Supabase.
- src/components/ui.tsx — componentes visuais reutilizados.
- src/screens/ — telas separadas por funcionalidade.
- src/utils/ — funções auxiliares.
- src/assets/ — imagens e recursos visuais.
- supabase/functions/ — Edge Functions usadas pelo aplicativo.
- supabase/migrations/ — histórico de alterações no banco.
- public/supabase-config.js — configuração pública do cliente Supabase.
- public/icons/ — ícones do aplicativo.

## Supabase e segurança
O projeto está conectado ao Supabase de produção. O arquivo public/supabase-config.js contém somente a URL e a chave pública (publishable/anon) do cliente.

- Nunca coloque service_role, secret keys, senhas ou tokens privados em arquivos public/, no código do navegador ou no GitHub.
- Operações administrativas devem continuar protegidas pelas Edge Functions e pelas políticas RLS do banco.
- Alterações de estrutura do banco devem ser registradas em uma migration SQL em supabase/migrations/ e aplicadas ao projeto Supabase correto.
- Para alterações apenas de interface e comportamento que usam tabelas existentes, não crie migrations sem necessidade.

## Publicação
O repositório GitHub VinniDev3377/Talk-marista está conectado ao Vercel. A branch main é a versão de produção. Após enviar uma alteração validada para main, o Vercel inicia a publicação automaticamente.

Aplicativo: https://talk-marista-app.vercel.app/
Repositório: https://github.com/VinniDev3377/Talk-marista

## Padrão de manutenção
- Preserve o estilo visual atual: cores, tipografia, espaçamentos e componentes.
- Prefira mudanças pequenas e localizadas.
- Mantenha os tipos em TypeScript atualizados.
- Reutilize os componentes de src/components/ui.tsx.
- Explique funções e trechos não óbvios com comentários curtos; evite comentários que apenas repetem o nome do código.
- Antes de enviar alterações, execute npm run build.