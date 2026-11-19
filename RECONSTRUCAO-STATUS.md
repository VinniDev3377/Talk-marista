# Talk Marista — reconstrução editável (etapa de portabilidade funcional)

## Proteção da versão publicada

Este diretório é um ambiente independente. Nenhum arquivo foi enviado ao Netlify e o endereço `https://talkmarista10.netlify.app/` não foi alterado.

## Base recuperada

- Código-fonte React + TypeScript da versão 6.2.2.
- Bundle, CSS, HTML, manifesto, ícones e imagens da versão publicada copiados para `referencia-versao-publicada/` apenas como referência.
- Perfil Administrador removido da aplicação editável; permanecem Morador e Portaria.

## Funcionalidades portadas nesta etapa

- Cadastro de moradores pela Portaria, pesquisa, edição de nome/telefone e exclusão.
- Encomendas com abas Pendentes e Retiradas.
- Registro de retirada com nome de quem retirou e data/hora.
- Pré-solicitação de mudança pelo morador, com data, horário e responsável.
- Consulta e acompanhamento das solicitações pelo morador.
- Aprovação, recusa e conclusão pela Portaria.
- Atualização e remoção genéricas no estado React e migração compatível de dados antigos do `localStorage`.

## Limitações importantes — não publicar ainda

1. As novas funcionalidades ainda usam `localStorage`. Não há sincronização entre aparelhos nesta etapa.
2. O modelo SQL recuperado não foi alinhado nem migrado para as novas entidades `residents` e `moves`.
3. O código de autenticação Supabase existe na base recuperada, mas as telas de negócio ainda não usam repositórios remotos. Não confundir o indicador de configuração do cliente com sincronização concluída.
4. A instalação de dependências não foi possível porque o ambiente de execução não conseguiu resolver `registry.npmjs.org` (sem acesso DNS/rede). Por isso `npm run build` e o typecheck completo não puderam ser executados.
5. Foi feita verificação de sintaxe/transpilação TypeScript/TSX em 29 arquivos, sem diagnósticos sintáticos. Isso não substitui build, checagem de tipos nem testes em navegador.

## Próxima etapa obrigatória

- Em ambiente com npm disponível, executar `npm install`, `npm run typecheck` e `npm run build`; corrigir todos os erros encontrados.
- Completar a modelagem e as políticas RLS para moradores e mudanças, revisando permissões por perfil.
- Implementar repositórios Supabase e armazenamento de fotos seguro; substituir a persistência local das telas por operações remotas.
- Testar com as contas reais de Morador e Portaria em navegadores/dispositivos separados.
- Somente após esses testes, gerar o pacote de implantação para Netlify.

**Não executar SQL antigo ou publicar este pacote como versão final.** Não inserir `service_role` em frontend ou em variáveis `VITE_*`; usar somente chave pública com RLS validado.
