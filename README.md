# Talk Marista

Aplicativo de gestão condominial para moradores e equipe de Portaria. O projeto utiliza React, TypeScript e Vite no front-end, com Supabase no back-end para autenticação, dados, arquivos e atualizações em tempo real.

**Versão:** 6.3.1  
**Aplicação:** https://talk-marista-app.vercel.app/  
**Repositório:** https://github.com/VinniDev3377/Talk-marista

## Organização do projeto

```text
Talk-marista/
├── frontend/                 # Aplicação web (React + TypeScript)
│   ├── public/               # PWA, ícones e configuração pública
│   └── src/
│       ├── assets/           # Imagens e recursos visuais
│       ├── cloud/            # Cliente e integração com Supabase
│       ├── components/       # Componentes compartilhados
│       ├── screens/          # Telas e módulos do aplicativo
│       └── utils/            # Funções auxiliares
├── backend/                  # Serviços e banco de dados
│   ├── supabase/
│   │   ├── functions/        # Edge Functions
│   │   └── migrations/       # Migrações SQL versionadas
│   └── sql/                  # Scripts de referência e diagnóstico
├── docs/                     # Documentação técnica
├── .github/workflows/        # Validação e publicação automatizadas
├── package.json              # Dependências e comandos do projeto
├── tsconfig.json             # Configuração TypeScript
└── vite.config.ts            # Configuração de desenvolvimento e build
```

## Tecnologias

- **Front-end:** React 18, TypeScript, Vite, CSS e Lucide React.
- **Back-end:** Supabase (PostgreSQL, Auth, Storage, Realtime e Edge Functions em Deno).
- **Entrega:** GitHub Actions e Vercel.

## Executar no Visual Studio Code

Requisitos: Node.js 20 LTS ou compatível e Visual Studio Code.

1. Baixe ou clone o repositório.
2. Abra a pasta principal `Talk-marista` no VS Code.
3. No terminal integrado, execute `npm install`.
4. Execute `npm run dev` e abra o endereço local indicado.
5. Para testar em outro dispositivo da mesma rede, execute `npm run dev:ios`.

Para validar a versão de produção, execute `npm run build`. O resultado será gerado em `dist/`.

## Configuração e segurança

O arquivo `frontend/public/supabase-config.js` contém apenas a URL do projeto e a chave pública publishable/anon, própria para uso no navegador. Nunca adicione service role keys, senhas, tokens privados ou credenciais administrativas ao front-end ou ao Git.

As operações administrativas devem permanecer protegidas pelas Edge Functions e pelas políticas RLS do Supabase. Alterações no banco devem ser registradas em `backend/supabase/migrations/`.

## Publicação

A branch `main` é a versão de produção e está conectada ao Vercel. O build é executado a partir da raiz do repositório; o Vite utiliza `frontend/` como diretório da aplicação e gera os arquivos em `dist/`.

As alterações em `backend/supabase/` também podem acionar o fluxo de publicação do Supabase, desde que os secrets necessários estejam configurados no GitHub.

## Padrões de contribuição

- Mantenha a separação entre interface (`frontend/`) e serviços/dados (`backend/`).
- Prefira componentes e funções reutilizáveis.
- Comente decisões e trechos não óbvios; evite comentários redundantes.
- Preserve a experiência visual existente, salvo solicitação explícita.
- Execute `npm run build` antes de integrar alterações.
