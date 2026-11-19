# Talk Marista — projeto editável

Este é o ambiente de desenvolvimento independente do aplicativo Talk Marista.

## Requisitos
- Node.js LTS
- npm

## Instalação e execução local
No terminal, dentro desta pasta:

```bash
npm install
npm run dev
```

Para gerar a versão de produção:

```bash
npm run build
npm run preview
```

## Variáveis Supabase (somente depois da etapa de integração)
Crie `.env.local` com:

```dotenv
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_PUBLICA
```

Não use a chave `service_role` no frontend.

## Importante
O código-fonte recuperado é anterior ao bundle atualmente publicado. Consulte `RECONSTRUCAO-STATUS.md` antes de qualquer uso. O site público não foi modificado.
