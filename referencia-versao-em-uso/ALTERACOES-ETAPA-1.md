# Talk Marista — etapa 1 de ajustes

Esta versão parte do arquivo `versao beta para teste.zip` enviado na conversa.

## Alterações implementadas nesta etapa

- Removida a opção de perfil Administrador da lista de acesso de demonstração e removido o encaminhamento para o painel administrativo.
- Sessões antigas que ainda estejam salvas como Administrador deixam de ser reabertas automaticamente.
- Portaria: moradores organizados por apartamento, com nome, tipo e telefone; foram adicionadas ações para editar e excluir cadastros, além do cadastro já existente.
- Portaria: encomendas separadas em abas Pendentes e Retiradas.
- Retirada de encomenda: exige o nome de quem retirou e registra data/hora junto ao status.
- Morador: Serviços ganhou pré-solicitação de mudança, com data, horário, tipo e responsável/empresa; a solicitação aparece para análise na Portaria.
- Portaria: solicitações de mudança pendentes podem ser aprovadas ou recusadas; as aprovadas seguem para o fluxo de mudança agendada. A recusa fica registrada como `Recusada`, com data/hora da análise. A Portaria dispõe dos botões Aprovar e Recusar nas solicitações pendentes.

## Limitações conhecidas e próxima etapa

- Esta versão ainda usa `localStorage` no navegador. Portanto, os dados ainda não são compartilhados automaticamente entre dispositivos ou navegadores. A sincronização central será feita na etapa seguinte com o banco Supabase, após configuração do projeto e integração autenticada.
- O login de demonstração ainda não equivale a autenticação de produção. Antes do uso real, será necessário concluir a autenticação, as permissões por perfil e as regras de acesso do banco.
- O componente antigo do painel administrativo foi removido do JavaScript compilado; seus estilos exclusivos e instruções de login também foram removidos. A migração de sessões antigas agora aceita somente os perfis Morador e Portaria.
- A checagem `node --check app.js` valida sintaxe JavaScript. A tentativa de abrir o app com Chromium/Playwright neste ambiente foi bloqueada pelo ambiente de execução (`ERR_BLOCKED_BY_ADMINISTRATOR`), portanto não foi possível concluir teste funcional real em navegador nesta sessão. A auditoria estática e as verificações de integridade do pacote foram executadas; ainda será necessário testar em navegador real, celular e múltiplas sessões.

## Não instalar em lojas

O projeto continua sendo uma aplicação web/PWA. Esta etapa não publica o sistema na App Store nem na Play Store.


## Limpeza do perfil Administrador

- Removido o componente legado do painel administrativo.
- Removidas regras CSS exclusivas do painel administrativo.
- Removidas as instruções e credenciais antigas do Administrador do guia de instalação.
- A restauração de sessão descarta qualquer perfil que não seja `morador` ou `portaria`.
