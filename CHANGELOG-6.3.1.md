# Talk Marista 6.3.1

- Integração central de dados das telas com o Supabase.
- Mapeamento ajustado ao esquema real informado: `accesses`, `family_members`, `residents`, `packages`, `visitors`, `workers`, `reservations` e `moves`.
- Carregamento dos dados reais por apartamento para moradores e visão geral para Portaria, respeitando as políticas RLS.
- Inclusão de chamados de serviço vinculados à tabela `service_requests`.
- Fotos de encomendas em bucket privado e histórico automático em `package_events` por migração incremental.
- Migração de notificações corrigida para `accesses` e `workers.worker_type`.
- Mantidos layout e identidade visual da versão editável anterior.
