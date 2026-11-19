# Talk Marista 6.3.1 — relatório de integração

## Alterações incluídas

- Adaptador central de persistência Supabase em `src/cloud/appData.ts`.
- Carregamento dos registros reais ao entrar com sessão autenticada; o aplicativo não mistura os registros demonstrativos com os registros da nuvem nessa sessão.
- Inserção, atualização e exclusão remotas para moradores, visitantes, familiares, trabalhadores, encomendas, acessos, reservas e mudanças.
- Conversão dos campos da interface para o esquema confirmado: `date` → `visit_date`, `type` → `visitor_type`/`worker_type`, `date` e `time` → `reservation_date`/`reservation_time` ou `move_date`/`move_time`, e `type` → `access_type`.
- IDs UUID gerados para novos registros.
- Fotos de encomendas usando bucket privado `package-photos` e coluna `packages.photo_path` (incluídos na migração incremental 003).
- Histórico automático de eventos em `package_events` ao receber/alterar o status de uma encomenda.
- Migração de notificações corrigida para a tabela `accesses` e coluna `workers.worker_type`.
- Endpoints legados ajustados de `access_logs` para `accesses` e de `picked_up_at` para `withdrawn_at`.

## Limites de validação

- O código foi alterado para o esquema de colunas fornecido pelo usuário e conferido estaticamente.
- A instalação de dependências npm expirou por timeout no ambiente desta execução. Portanto, não foi possível aprovar `npm run build`/typecheck completo.
- Não há conexão administrativa com o projeto Supabase nesta sessão; não foi possível aplicar migrações, publicar Edge Functions, inspecionar policies atuais nem testar gravações reais no banco.
- O fluxo de cadastro/aprovação exige que as migrações 001–003 e as Edge Functions estejam publicadas, conforme `INSTALAR-ATUALIZACAO-SUPABASE.md`.


## Antes de uso real

Aplicar as migrações, publicar as Edge Functions, configurar a chave pública e concluir os testes de aceitação. Não considerar o sistema pronto para operação de condomínio até esses testes passarem.

## Ajuste após conferência do esquema

- Confirmado pelo usuário que `public.apartments.number` é `text NOT NULL` e chave primária (`apartments_pkey`), portanto as referências de apartamento nas migrações 001 e 002 correspondem ao esquema informado.
- Corrigida a ordem de aplicação documentada: 001, 002, 004 e, por último, 003, pois 003 depende das funções auxiliares criadas em 004.
