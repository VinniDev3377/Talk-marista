# Etapa 3 — interface de primeiro acesso

- Criadas as abas Entrar e Primeiro acesso na tela de autenticação.
- A tela de cadastro reutiliza `BUILDING_IMAGE`, véu azul, logotipo e estilo de campos do Talk Marista.
- Campos: nome completo, apartamento, senha e confirmação da senha.
- Validações de nome/sobrenome, apartamento permitido, mínimo de 8 caracteres e confirmação.
- Aviso explícito de que a Portaria precisa aprovar o cadastro.
- Nenhuma senha é armazenada no navegador ou enviada nesta etapa.
- O backend seguro, a fila de aprovação da Portaria e o login nome + apartamento + senha continuam pendentes; não considerar o cadastro em produção ativo.
