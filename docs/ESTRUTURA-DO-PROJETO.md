# Organização técnica

## Front-end
A interface está em `frontend/`. O ponto de entrada é `frontend/src/main.tsx`; a composição e navegação geral ficam em `frontend/src/App.tsx`.

- `screens/`: telas por módulo e perfil.
- `components/`: componentes compartilhados.
- `cloud/`: autenticação, cliente Supabase, consultas e sincronização.
- `assets/`: imagens e recursos estáticos importados pelo código.
- `utils/`: utilitários independentes.
- `public/`: arquivos servidos sem processamento, como manifesto PWA, ícones, service worker e configuração pública.

## Back-end
O back-end está em `backend/`.

- `supabase/functions/`: funções Deno executadas no servidor.
- `supabase/migrations/`: alterações incrementais do banco de dados.
- `supabase/config.toml`: configuração da CLI do Supabase.
- `sql/`: scripts auxiliares de referência e diagnóstico.

## Arquivos de configuração na raiz
Os arquivos `package.json`, `tsconfig.json` e `vite.config.ts` ficam na raiz para que GitHub Actions e Vercel executem os comandos a partir do diretório principal. O Vite usa `frontend/` como raiz da aplicação e gera o build em `dist/`.

## Regras para alterações
1. Código de interface e lógica executada no navegador: `frontend/`.
2. Funções seguras, migrations e operações de banco: `backend/`.
3. Nunca armazenar segredos no front-end.
4. Toda mudança de banco deve ter migration revisável.
5. Validar com `npm run build` antes de integrar.
