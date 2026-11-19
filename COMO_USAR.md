# Talk Marista 6.2.0 — modo local instalável

Aplicativo web (React + Vite) que funciona sem banco de dados: os cadastros ficam salvos somente no navegador/aparelho usado. Após a primeira visita online, o cache do aplicativo permite reabri-lo sem rede em navegadores compatíveis.

**Limite importante do modo local:** cada aparelho/navegador mantém sua própria cópia dos dados. Morador e portaria não compartilham cadastros entre dispositivos sem banco de dados. As contas são demonstrativas e não devem ser usadas como autenticação segura para operação condominial real.

## Contas de demonstração

As contas **não aparecem mais na tela de login** e nada vem preenchido. Selecione o perfil e digite:

| Perfil | Usuário | Senha | Apartamento |
|---|---|---|---|
| Morador | `morador` | `marista123` | escolha na lista |
| Portaria | `portaria` | `portaria123` | — |
| Administrador | `admin` | `admin123` | — |

(As contas ficam em `src/constants.ts`, em `DEMO_ACCOUNTS`.)

## Como executar no computador

1. Instale o Node.js LTS: https://nodejs.org/
2. Extraia o ZIP, abra um terminal na pasta e rode `npm install`.
3. Rode `npm run dev` e abra o endereço mostrado (normalmente `http://localhost:5173`).

Para apagar os dados de teste, limpe os dados do site no navegador.

## Testar no iPhone (mesma rede Wi-Fi)

1. No computador, rode `npm run dev:ios`.
2. No Safari do iPhone, abra o endereço de rede mostrado no terminal (ex.: `http://192.168.1.20:5173/`), nunca `localhost`.
3. Para criar o ícone: **Compartilhar → Adicionar à Tela de Início**.

O computador precisa ficar ligado com o terminal aberto. A câmera da portaria (foto de encomendas) no iPhone exige **HTTPS** quando o app é publicado; pelo IP local o Safari pode pedir/limitar a permissão.

## Trocar as imagens provisórias por fotos reais

As imagens ficam em `src/assets/imagens/`. Hoje são ilustrações provisórias (`.svg`).
Para usar uma foto real, **coloque o arquivo na mesma pasta com o mesmo nome** (`.jpg`, `.png` ou `.webp`). Ele é usado automaticamente no lugar do `.svg`, sem mexer em código.

| Arquivo | Onde aparece |
|---|---|
| `predio` | Tela inicial, login e painel do morador |
| `espaco-grill` | Espaço Grill |
| `salao-de-festas` | Salão de Festas |
| `espaco-gourmet` | Espaço Gourmet |
| `brinquedoteca` | Brinquedoteca |
| `academia` | Academia |
| `sauna` | Sauna |
| `salao-de-jogos` | Salão de Jogos |
| `piscina` | Piscina |

Dica: use fotos horizontais de ~1400 px de largura (até ~300 KB cada).

## Estrutura do projeto

```
src/
  main.tsx            ponto de entrada
  App.tsx             navegação, sessão e escolha da tela
  types.ts            tipos do aplicativo
  constants.ts        apartamentos, espaços de lazer, opções de encomenda, contas demo
  storage.ts          dados salvos no aparelho + dados fictícios
  images.ts           carrega as imagens de assets/imagens
  styles.css          estilos (organizados por seção)
  components/ui.tsx   componentes reutilizados (cabeçalho, modal, foto, ...)
  screens/            uma tela por arquivo
  utils/photo.ts      reduz o tamanho das fotos tiradas
  cloud/              Supabase: client, auth, api (todos os endpoints comentados)
```

## Quem pode o quê

| Função | Morador | Portaria | Admin |
|---|---|---|---|
| Ver encomendas | só do seu apto | todas | todas |
| **Cadastrar encomenda** (foto, nome, apto, tipo, tamanho) | não | **sim** | não |
| Reservas, visitantes, familiares | sim | — | — |
| Liberar visitantes / histórico de acessos | — | sim | via painel |
