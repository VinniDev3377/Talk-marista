# Talk Marista 6.2.1 — documentação do código

Este documento explica a organização do projeto e complementa os comentários inseridos nos arquivos-fonte. Os comentários foram escritos em português e descrevem a finalidade dos módulos, funções, parâmetros, componentes, estilos e regras de acesso.

## 1. Linguagens e formatos utilizados

| Linguagem/formato | Onde aparece | Responsabilidade |
|---|---|---|
| TypeScript (`.ts`) | `src/`, `vite.config.ts` | Tipos, regras de estado, armazenamento, autenticação e serviços de dados. |
| TSX (`.tsx`) | `src/` | Componentes React e telas com marcação JSX tipada. |
| CSS (`.css`) | `src/styles.css` | Cores, tipografia, layout, componentes e adaptação a celular/tablet/desktop. |
| JavaScript (`.js`) | `public/sw.js` | Service worker: cache dos arquivos, fotos e suporte de reabertura offline. |
| HTML (`.html`) | `index.html` | Documento inicial, metadados, ícones e elemento raiz do React. |
| SQL (`.sql`) | `supabase_schema.sql` | Funções auxiliares, índices, tabelas/colunas adicionais, bucket e políticas RLS. |
| JSON (`.json`) | `package.json`, `tsconfig.json` | Dependências, scripts e opções de compilação do TypeScript. JSON não aceita comentários; por isso cada propriedade é explicada neste documento. |
| Web App Manifest (`.webmanifest`) | `public/manifest.webmanifest` | Nome, ícones, cores e comportamento de instalação do PWA. É JSON válido e não aceita comentários dentro do arquivo. |
| SVG/XML (`.svg`) | `src/assets/imagens/` | Ilustrações vetoriais locais usadas como apoio/fallback visual. Os arquivos possuem comentários XML. |

## 2. Organização das pastas

- `src/App.tsx`: componente raiz, sessão, navegação e seleção da tela ativa.
- `src/main.tsx`: ponto de entrada React e registro do service worker em produção.
- `src/screens/`: telas separadas por funcionalidade (morador, portaria, administração, reservas e cadastros).
- `src/components/ui.tsx`: componentes visuais compartilhados para evitar duplicação.
- `src/cloud/`: cliente Supabase, autenticação, tipos, repositórios e endpoints de dados remotos.
- `src/storage.ts`: dados de demonstração e persistência local no navegador.
- `src/types.ts` e `src/cloud/types.ts`: contratos de dados usados pela aplicação.
- `src/constants.ts`: listas de apartamentos, áreas de lazer, opções e contas demonstrativas.
- `src/images.ts` e `src/assets/imagens/`: catálogo de fotos e ilustrações locais.
- `src/utils/photo.ts`: leitura, redimensionamento e compressão das fotos.
- `src/styles.css`: estilos visuais e regras responsivas.
- `public/`: ícones, manifesto PWA e service worker.
- `supabase_schema.sql`: extensão do esquema SQL e políticas operacionais documentadas.

## 3. Como ler os comentários

- Comentários `/** ... */` antes de funções e componentes descrevem a finalidade da operação.
- Tags `@param` explicam o significado de cada parâmetro e o dado esperado.
- Comentários internos `//` explicam decisões de implementação, validações, cache e transformações.
- Comentários CSS separam as áreas visuais e indicam o comportamento de cada conjunto de regras.
- Comentários SQL explicam a finalidade de funções, índices, políticas e armazenamento privado.
- Os arquivos JSON permanecem sem comentários para não invalidar sua sintaxe; suas chaves são explicadas abaixo.

## 4. Configurações JSON

### `package.json`

- `name`: nome interno do projeto.
- `private`: impede publicação acidental do pacote no registro npm.
- `version`: versão atual do aplicativo.
- `type`: indica que os arquivos JavaScript usam módulos ES.
- `scripts.dev`: inicia o servidor de desenvolvimento Vite.
- `scripts.dev:ios`: inicia o Vite acessível pela rede local para testes em celular.
- `scripts.build`: executa verificação TypeScript e gera a versão de produção.
- `scripts.preview`: serve localmente a pasta compilada para conferência.
- `scripts.typecheck`: verifica os tipos sem gerar arquivos.
- `dependencies`: bibliotecas usadas durante a execução (React, Supabase e ícones).
- `devDependencies`: ferramentas de desenvolvimento, compilação e tipos.

### `tsconfig.json`

- `target` e `lib`: definem os recursos de JavaScript e APIs disponíveis.
- `module` e `moduleResolution`: definem o formato de módulos e a resolução de imports.
- `jsx`: seleciona a transformação JSX usada pelo React.
- `strict`: habilita verificações rigorosas de tipos.
- `isolatedModules`: exige módulos que possam ser transformados individualmente.
- `resolveJsonModule`: permite importar arquivos JSON tipados.
- `esModuleInterop`: melhora a interoperabilidade entre formatos de módulos.
- `skipLibCheck`: evita revalidar declarações internas de dependências.
- `noEmit`: impede que o TypeScript gere JavaScript nesta etapa.
- `include`: informa os arquivos incluídos na verificação.

### `public/manifest.webmanifest`

- `id`, `start_url` e `scope`: identificam o aplicativo e a área controlada pela instalação.
- `name` e `short_name`: nomes completos e compactos apresentados pelo sistema.
- `description` e `lang`: descrição e idioma do aplicativo.
- `display` e `orientation`: modo de exibição e orientação preferida.
- `background_color` e `theme_color`: cores usadas na abertura e na interface do navegador.
- `icons`: caminhos, dimensões, tipos e finalidades dos ícones instaláveis.

## 5. Endpoints Supabase

Os endpoints de domínio estão em `src/cloud/api.ts`. Eles são organizados por módulo:

- **Encomendas (`packages`)**: listar, enviar foto, gerar link temporário, cadastrar, marcar retirada e acompanhar alterações em tempo real.
- **Visitantes (`visitors`)**: listar, cadastrar, alterar status e acompanhar alterações.
- **Familiares (`family_members`)**: listar, cadastrar e remover.
- **Funcionários/prestadores (`workers`)**: listar, cadastrar e ativar/desativar autorização.
- **Reservas (`reservations`)**: listar e criar reservas.
- **Solicitações (`service_requests`)**: listar, criar e atualizar andamento.
- **Comunicados (`communications`)**: listar avisos ativos e publicar novos avisos.
- **Acessos (`access_logs`)**: listar histórico, registrar movimentações e acompanhar alterações.

As operações genéricas ficam em `src/cloud/repositories.ts`: `listRows`, `insertRow`, `updateRow`, `deleteRow` e `subscribeTable`. O arquivo `src/cloud/auth.ts` cuida do perfil autenticado. As permissões de banco devem ser aplicadas por políticas RLS no Supabase; comentários no código não substituem essas políticas.

## 6. Modo de demonstração e limites

Sem `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`, o app permanece no modo local e os registros ficam no armazenamento do navegador/dispositivo. Isso é adequado para explorar a interface, mas não sincroniza dados entre morador, portaria e administração. As contas e os registros de demonstração são fictícios e não devem ser usados para controlar acessos reais.

O SQL deste pacote é uma extensão operacional e pressupõe que o esquema base mencionado no próprio arquivo já exista. Não execute isoladamente em um projeto Supabase vazio. Antes de habilitar a nuvem, confira as políticas anteriores, pois políticas permissivas antigas podem ampliar permissões.

## 7. Comandos de verificação

Na pasta do projeto, após instalar as dependências:

```bash
npm install
npm run typecheck
npm run build
npm run dev
```

A compilação `npm run build` é a verificação principal: executa o TypeScript e gera os arquivos otimizados do Vite. Também é necessário testar manualmente login, navegação, cadastros, fotos, modo offline e os perfis em dispositivos reais.
