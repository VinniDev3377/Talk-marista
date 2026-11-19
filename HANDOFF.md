# Contexto para continuar o projeto (leia primeiro)

App de condomínio **Talk Marista** (Goiânia, Setor Marista). React 18 + TypeScript + Vite, pensado para celular (iPhone/Android, PWA). Textos e comentários em português do Brasil. Versão 6.2.0.

## Estado atual
Protótipo funcional em modo demonstração: os dados ficam no `localStorage` do aparelho (`src/storage.ts`). O Supabase está preparado (`src/cloud/`), mas **as telas ainda não usam**.

Pronto: código limpo e organizado, endpoints comentados, bug do voltar da portaria corrigido (navegação por histórico em `App.tsx`), 8 espaços de lazer com imagem, login sem preenchimento automático, cadastro de encomendas (foto, nome, apto, tipo, tamanho) **somente no perfil portaria**.

## Pendências (em ordem de prioridade)
1. **Fotos reais**: `src/assets/imagens/` tem ilustrações `.svg` provisórias. Basta colocar `.jpg/.png/.webp` com o MESMO nome (`predio`, `espaco-grill`, `salao-de-festas`, `espaco-gourmet`, `brinquedoteca`, `academia`, `sauna`, `salao-de-jogos`, `piscina`); `src/images.ts` dá prioridade ao formato real. Não inventar nem baixar fotos de terceiros sem autorização.
2. **Ligar as telas ao Supabase** usando `src/cloud/api.ts` (hoje as telas chamam `add(...)` de `App.tsx`). Sem isso, a portaria e o morador não compartilham dados.
3. Rodar `npm install && npm run build` (nunca foi executado com as dependências reais) e testar a câmera em iPhone real (exige HTTPS).
4. Executar `supabase_schema.sql` (o V4 base com tabelas e políticas NÃO está no pacote). Remover qualquer política antiga que permita morador/admin inserir em `packages`.
5. Confirmar a numeração real dos apartamentos: o app usa 301–2404 (88 unidades), mas fontes públicas falam em 84 residências, térreo + 21 andares.

## Mapa do código
```
src/App.tsx            sessão, histórico de navegação (go/tab/back), função add(), troca de telas
src/types.ts           tipos (Screen, AppState, Delivery...)
src/constants.ts       APARTMENTS, LEISURE_SPACES, PACKAGE_KINDS/SIZES, DEMO_ACCOUNTS, HOME_SCREEN
src/storage.ts         dados fictícios + localStorage (chave talk-marista-v3)
src/screens/           uma tela por arquivo
src/components/ui.tsx  Header, Bottom, Modal, ListItem, Chips, PhotoPicker...
src/cloud/api.ts       todos os endpoints Supabase, cada um comentado
src/styles.css         CSS por seções
```

## Regras de negócio já decididas
- Cadastro de encomenda: **só portaria**. Morador vê apenas as do seu apartamento; admin vê todas, sem cadastrar.
- Campos da encomenda: foto (opcional, câmera via `capture="environment"`, comprimida em `utils/photo.ts`), destinatário, apartamento, tipo (Caixa/Embalagem/Pacote), tamanho (Extra pequeno/Pequeno/Médio/Grande/Extra grande). Código de rastreio e transportadora foram removidos de propósito.
- Na tela inicial da portaria e do admin, "voltar" encerra a sessão.
- Login: nada pré-preenchido, `autoComplete` desligado, senhas demo não aparecem na tela (ficam em `DEMO_ACCOUNTS`).
- Demo: `morador`/`marista123` (escolhe apto), `portaria`/`portaria123`, `admin`/`admin123`.

## Como validar mudanças
Sem rede não é possível `npm install`. Com rede: `npm run typecheck` e `npm run dev`. Foram feitos 52 testes de navegador (Playwright) cobrindo login, voltar, cadastro com foto, permissões e lazer; recriar se mudar fluxos.


## Atualização de interface e robustez — 2026-11-16
- Refinada a identidade visual para azul-marinho/champagne, com melhor contraste, foco por teclado, cartões e responsividade desktop/mobile.
- O destaque de lazer da tela inicial agora é um botão acessível por teclado.
- Reservas bloqueiam datas anteriores ao dia local atual.
- Login e painéis internos informam claramente quando estão em modo local, sem sincronização.
- Adicionado service worker simples para cache do app após a primeira visita (não sincroniza dados nem substitui banco de dados).
- Itens informativos sem ação deixaram de ser botões para não prometer interações inexistentes.
- Fotos reais ainda aguardam arquivos fornecidos pelo condomínio ou autorização expressa para reutilizar imagens de galerias públicas. Os SVG continuam sendo apenas fallback temporário.
- Atenção: a lista de apartamentos no código gera 88 unidades (301–2404); a página pública do empreendimento consultada informa 84 residências. Confirmar numeração oficial com a administração antes de usar cadastros operacionais.
- Validação de build pendente: a instalação das dependências foi bloqueada por falha DNS ao acessar registry.npmjs.org neste ambiente. A sintaxe TS/TSX foi verificada sem diagnósticos de transpile.
