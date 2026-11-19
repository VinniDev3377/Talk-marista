# Histórico de alterações — Talk Marista

## 6.2.2 — Código documentado
- Inclusão de comentários em português nos módulos TypeScript/TSX, componentes, telas, parâmetros e endpoints Supabase.
- Explicação das seções de CSS, do service worker, do HTML, das funções e políticas SQL.
- Inclusão de `DOCUMENTACAO-DO-CODIGO.md`, com arquitetura e explicação dos arquivos JSON, que não aceitam comentários internos.
- Nenhuma funcionalidade ou regra de negócio foi intencionalmente alterada nesta revisão.

# Histórico de versões — Talk Marista

## 6.2.0 — 16/11/2026
- Atualização visual com identidade azul-marinho e champagne.
- Melhorias de responsividade e acessibilidade dos controles.
- Validação de data mínima para novas reservas.
- Identificação explícita do modo local no login.
- Cache de aplicação com service worker para reabertura offline após o primeiro carregamento.
- Itens informativos sem ação agora são apresentados como conteúdo, não como botões.

### Pendências antes de considerar produção operacional
- Inserir fotos reais autorizadas do prédio e de cada espaço de lazer.
- Confirmar a relação oficial de apartamentos (o código lista 88, enquanto a página pública consultada informa 84 residências).
- Instalar dependências e executar `npm run typecheck` e `npm run build` em ambiente com acesso ao npm.
- Testar instalação PWA, câmera e fluxos completos em iPhone, Android e desktop.
- Para uso compartilhado por moradores e portaria, configurar banco/autenticação e regras de segurança.
