# Talk Marista 6.3.1 — atualização de integração

Este pacote preserva o projeto editável React/TypeScript e os recursos visuais da versão anterior. A atualização conecta as telas operacionais ao Supabase usando o esquema informado no histórico desta conversa.

## Comece por aqui

1. Leia `INSTALAR-ATUALIZACAO-SUPABASE.md`.
2. Faça backup do banco e aplique as migrações 001, 002, 003 e 004 em ordem.
3. Publique as Edge Functions `resident-register` e `resident-review`.
4. Coloque a chave pública `sb_publishable_...` em `public/supabase-config.js`.
5. Na pasta do projeto, execute `npm install` e depois `npm run build`.
6. Teste os fluxos com uma conta de morador e outra de Portaria conforme o roteiro do instalador.

## O que grava na nuvem

Moradores (cadastros administrativos), visitantes, familiares, trabalhadores/prestadores, encomendas, acessos, reservas, mudanças e solicitações de serviço. A Portaria vê os registros de todos os apartamentos; o morador consulta os registros limitados ao seu apartamento, conforme RLS.

## Atenção

- A configuração incluída contém a URL do projeto e um espaço para a chave pública; a chave real não foi embutida.
- Nunca use a chave `service_role` no frontend.
- A fila de aprovação de novos moradores depende das migrações e Edge Functions.
- O build completo e os testes contra o banco real ainda precisam ser executados no ambiente do projeto: a instalação de dependências expirou por timeout durante a preparação deste ZIP. O relatório `RELATORIO-VALIDACAO-ETAPA-6.md` descreve o que foi e não foi validado.
