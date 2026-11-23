# Guia rápido — Talk Marista 6.3.1

O código está dividido em duas áreas principais:

- `frontend/`: interface React + TypeScript.
- `backend/`: funções Supabase, migrations e scripts SQL.

Abra a pasta principal do repositório no VS Code. Para executar localmente, é necessário Node.js 20 LTS ou compatível.

```bash
npm install
npm run dev
```

Para testar em outro dispositivo na mesma rede, use `npm run dev:ios`. Para verificar a compilação de produção, use `npm run build`.

Consulte o [README.md](README.md) para a arquitetura completa, configuração e publicação. Nunca coloque senhas, service role keys ou tokens privados no código do navegador ou no GitHub.
