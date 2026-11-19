# Talk Marista — checklist de produção

## Nuvem
- Criar projeto Supabase
- Configurar `.env.local`
- Executar `supabase_schema.sql`
- Criar usuários no Authentication
- Criar registros em `profiles`
- Ativar Realtime para `packages`, `visitors` e `access_logs`

## Segurança
- RLS ativo
- `service_role` nunca no frontend
- Roles revisadas
- Domínio de produção configurado
- Recuperação de senha configurada

## Morador
- Login real
- Familiares
- Visitantes
- Funcionários/prestadores
- Encomendas
- Reservas
- Serviços
- Comunicados

## Portaria
- Busca por apartamento
- Entrada/saída
- Encomendas em tempo real
- Visitantes em tempo real
- Histórico de acessos

## Administrador
- Usuários
- Permissões
- Apartamentos
- Comunicados
- Relatórios
- Auditoria

## Performance
- Índices por apartamento/data
- Paginação quando necessário
- Realtime somente nas telas críticas
- Evitar polling
