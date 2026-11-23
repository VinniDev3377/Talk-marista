# Documentação técnica — Talk Marista 6.3.1

## Linguagens e tecnologias

| Tecnologia | Localização | Finalidade |
|---|---|---|
| TypeScript / TSX | `frontend/src/` | Regras da aplicação, tipos e componentes React. |
| CSS | `frontend/src/styles.css` | Estilo visual e adaptação responsiva. |
| JavaScript | `frontend/public/` | Configuração pública e service worker do PWA. |
| HTML | `frontend/index.html` | Documento inicial carregado pelo navegador. |
| TypeScript (Deno) | `backend/supabase/functions/` | Funções executadas no servidor Supabase. |
| SQL | `backend/supabase/migrations/` e `backend/sql/` | Estrutura e manutenção do banco PostgreSQL. |
| JSON / TOML / Web Manifest | Arquivos de configuração | Dependências, compilação, CLI e instalação PWA. |
| SVG | `frontend/src/assets/imagens/` | Ilustrações vetoriais usadas na interface. |

## Front-end

- `frontend/src/main.tsx`: inicializa React e o contexto de autenticação.
- `frontend/src/App.tsx`: controla sessão, navegação e composição das telas.
- `frontend/src/screens/`: módulos de Morador e Portaria.
- `frontend/src/components/`: componentes reutilizáveis.
- `frontend/src/cloud/`: cliente Supabase, autenticação, acesso a dados e sincronização.
- `frontend/src/storage.ts`: persistência local e dados de apoio.
- `frontend/src/types.ts` e `frontend/src/cloud/types.ts`: contratos de dados.
- `frontend/src/constants.ts`: listas e opções utilizadas pelo app.
- `frontend/src/utils/`: funções auxiliares.
- `frontend/src/styles.css`: estilos da aplicação.
- `frontend/public/`: ícones, manifesto PWA, service worker e configuração pública do Supabase.

## Back-end

- `backend/supabase/functions/portaria-user-admin/`: operações administrativas de usuários realizadas no servidor.
- `backend/supabase/functions/resident-register-/`: processamento de solicitações de cadastro de moradores.
- `backend/supabase/migrations/`: alterações incrementais do banco.
- `backend/supabase/config.toml`: configuração do projeto para a CLI Supabase.
- `backend/sql/`: scripts SQL auxiliares; revisar o conteúdo antes de executar manualmente.

## Configuração da compilação

Os arquivos `package.json`, `tsconfig.json` e `vite.config.ts` permanecem na raiz para manter os comandos de CI e a integração do Vercel simples. O Vite usa `frontend/` como raiz da aplicação e grava a saída em `dist/`.

Comandos principais:

```bash
npm install
npm run dev
npm run dev:ios
npm run typecheck
npm run build
```

## Segurança

A configuração em `frontend/public/supabase-config.js` contém somente valores públicos destinados ao cliente. Nunca inserir chaves secretas, service role, senhas ou tokens privados nessa pasta. A autorização de operações sensíveis deve ser aplicada no servidor e por políticas RLS no banco.

## Manutenção

1. Alterações de interface devem ficar em `frontend/`.
2. Alterações de banco ou funções seguras devem ficar em `backend/`.
3. Toda mudança de esquema deve ser registrada em uma migration.
4. Atualize esta documentação quando a arquitetura mudar.
5. Valide o projeto com `npm run build` antes de integrar.
