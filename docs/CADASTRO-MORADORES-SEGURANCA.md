# Primeiro acesso e aprovação de moradores — especificação de segurança

## Experiência aprovada

1. A tela de acesso tem duas abas: **Entrar** e **Primeiro acesso**.
2. No primeiro acesso, o morador informa nome completo, apartamento, cria uma senha e confirma a senha.
3. O pedido fica com status `pendente` e não concede acesso às telas nem aos dados do condomínio.
4. A Portaria consulta os pedidos e aprova ou recusa. Só após aprovação a conta recebe o perfil `morador` ativo associado ao apartamento confirmado.
5. Depois da aprovação, o morador entra com nome completo + apartamento + senha.
6. A Portaria continua com autenticação separada e não pode ser criada pela tela pública de cadastro.

## Identidade visual

A tela de cadastro utiliza o mesmo `BUILDING_IMAGE` da tela de boas-vindas e login, o mesmo véu azul escuro, logotipo, campos e botão principal. A apresentação se adapta a telas pequenas e respeita as áreas seguras de iPhone.

## Requisitos obrigatórios antes de ativar o envio

- O navegador nunca grava a senha em `localStorage`, tabela pública, log ou metadados.
- A criação de conta e a verificação de duplicidade devem ocorrer em Supabase Edge Function usando segredo `SUPABASE_SERVICE_ROLE_KEY` apenas no ambiente da função. Essa chave nunca vai para o frontend nem para este ZIP.
- A função valida apartamento existente, normaliza nome, impede pedidos/contas duplicados para o mesmo morador e aplica limite de tentativas.
- A senha é entregue diretamente ao serviço de autenticação do Supabase, que faz o hash; não criar coluna `password` ou `password_hash` em tabela pública.
- A conta pendente não pode consultar moradores, encomendas, visitantes, reservas, mudanças ou dados de outros apartamentos.
- A aprovação é feita por uma função protegida que exige sessão de Portaria e valida `profiles.role = 'portaria'` no servidor. Não confiar em campos enviados pelo navegador.
- A função de aprovação altera o estado de pendente para aprovado e vincula o perfil ao apartamento; a recusa bloqueia o acesso e registra motivo/data.
- O login por nome + apartamento deve resolver a identidade no servidor e só então autenticar com Supabase Auth. Não expor uma lista de e-mails/usuários nem permitir enumeração de moradores.
- RLS deve negar acesso por padrão e permitir operações apenas para perfis aprovados. A role `portaria` nunca pode ser autoatribuída pelo cadastro público.

## Estado desta entrega

A interface e as validações básicas do formulário estão preparadas. O formulário **não envia nem salva a senha**. A mensagem de confirmação informa explicitamente que o envio ainda depende do serviço seguro. O login remoto existente continua no formato antigo (e-mail + senha) até a Edge Function e as políticas de aprovação serem instaladas e testadas. Não execute migrações SQL antigas como substituição deste fluxo.
