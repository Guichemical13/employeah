# Documentação de Endpoints da API - EmploYEAH

## Autenticação

### POST `/api/auth/login`
- **Body:**
```json
{
  "email": "usuario@empresa.com",
  "password": "senha123"
}
```
- **Retorno:**
```json
{
  "token": "<jwt_token>"
}
```
- **Erros:**
  - 401: Credenciais inválidas

### GET `/api/auth/me`
- **Header:** `Authorization: Bearer <token>`
- **Retorno:**
```json
{
  "user": {
    "id": 1,
    "name": "Usuário",
    "email": "usuario@empresa.com",
    "role": "COLLABORATOR",
    "companyId": 1
  }
}
```
- **Erros:**
  - 401: Token ausente ou inválido

### POST `/api/auth/logout`
- **Ação:** Frontend remove token

---

## Empresas (role: SUPER_ADMIN)

### GET `/api/companies`
- Lista empresas
- **Header:** `Authorization: Bearer <token>`
- **Retorno:**
```json
[
  { "id": 1, "name": "Empresa X" },
  { "id": 2, "name": "Empresa Y" }
]
```

### POST `/api/companies`
- Cria empresa
- **Body:**
```json
{ "name": "Empresa Nova" }
```
- **Retorno:**
```json
{ "id": 3, "name": "Empresa Nova" }
```
- **Erros:**
  - 403: Permissão insuficiente

### PATCH `/api/companies/[id]`
- Edita empresa
- **Body:**
```json
{ "name": "Empresa Editada" }
```
- **Retorno:**
```json
{ "id": 1, "name": "Empresa Editada" }
```

### DELETE `/api/companies/[id]`
- Remove empresa
- **Retorno:**
```json
{ "success": true }
```

---

## Usuários (role: COMPANY_ADMIN)

### GET `/api/users`
- Lista usuários da empresa
- **Retorno:**
```json
[
  { "id": 1, "name": "Colaborador 1", "email": "colab1@empresa.com", "role": "COLLABORATOR" },
  { "id": 2, "name": "Admin", "email": "admin@empresa.com", "role": "COMPANY_ADMIN" }
]
```

### POST `/api/users`
- Cria colaborador
- **Body:**
```json
{ "name": "Novo Colaborador", "email": "novo@empresa.com", "password": "senha123" }
```
- **Retorno:**
```json
{ "id": 3, "name": "Novo Colaborador", "email": "novo@empresa.com", "role": "COLLABORATOR" }
```
- **Erros:**
  - 409: Email já cadastrado

### PATCH `/api/users/[id]`
- Edita usuário (admin ou próprio usuário)
- **Body:**
```json
{ "name": "Nome Editado" }
```
- **Retorno:**
```json
{ "id": 1, "name": "Nome Editado", "email": "colab1@empresa.com", "role": "COLLABORATOR" }
```

### DELETE `/api/users/[id]`
- Remove usuário
- **Retorno:**
```json
{ "success": true }
```

---

## Itens (role: COMPANY_ADMIN)

### GET `/api/items`
- Lista itens da empresa
- **Retorno:**
```json
[
  { "id": 1, "name": "Camiseta", "price": 100, "stock": 10, "categoryId": 1 },
  { "id": 2, "name": "Caneca", "price": 50, "stock": 20, "categoryId": 2 }
]
```

### POST `/api/items`
- Cria item
- **Body:**
```json
{ "name": "Boné", "price": 80, "stock": 15, "categoryId": 1 }
```
- **Retorno:**
```json
{ "id": 3, "name": "Boné", "price": 80, "stock": 15, "categoryId": 1 }
```

### PATCH `/api/items/[id]`
- Edita item
- **Body:**
```json
{ "stock": 12 }
```
- **Retorno:**
```json
{ "id": 1, "name": "Camiseta", "price": 100, "stock": 12, "categoryId": 1 }
```

### DELETE `/api/items/[id]`
- Remove item
- **Retorno:**
```json
{ "success": true }
```

---

## Categorias (role: COMPANY_ADMIN)

### GET `/api/categories`
- Lista categorias da empresa
- **Retorno:**
```json
[
  { "id": 1, "name": "Brindes" },
  { "id": 2, "name": "Utilidades" }
]
```

### POST `/api/categories`
- Cria categoria
- **Body:**
```json
{ "name": "Nova Categoria" }
```
- **Retorno:**
```json
{ "id": 3, "name": "Nova Categoria" }
```

### PATCH `/api/categories/[id]`
- Edita categoria
- **Body:**
```json
{ "name": "Categoria Editada" }
```
- **Retorno:**
```json
{ "id": 1, "name": "Categoria Editada" }
```

### DELETE `/api/categories/[id]`
- Remove categoria
- **Retorno:**
```json
{ "success": true }
```

---

## Transações de Pontos (role: COLLABORATOR)

### GET `/api/points/transactions`
- Lista transações do usuário autenticado
- **Retorno:**
```json
[
  { "id": 1, "type": "EARN", "amount": 100, "createdAt": "2025-06-25T12:00:00Z", "description": "Elogio recebido" },
  { "id": 2, "type": "SPEND", "amount": -50, "createdAt": "2025-06-26T12:00:00Z", "description": "Resgate de Caneca" }
]
```

### POST `/api/points/spend`
- Resgata item
- **Body:**
```json
{ "itemId": 1 }
```
- **Retorno:**
```json
{ "success": true, "transactionId": 3 }
```
- **Erros:**
  - 400: Saldo insuficiente
  - 404: Item não encontrado

---

## Elogios (role: COLLABORATOR)

### GET `/api/elogios`
- Lista elogios recebidos
- **Retorno:**
```json
[
  { "id": 1, "message": "Parabéns!", "fromId": 2, "toId": 1, "createdAt": "2025-06-25T12:00:00Z", "likes": 3 }
]
```

### POST `/api/elogios/create`
- Cria elogio
- **Body:**
```json
{ "message": "Ótimo trabalho!", "toId": 2 }
```
- **Retorno:**
```json
{ "id": 2, "message": "Ótimo trabalho!", "fromId": 1, "toId": 2, "createdAt": "2025-06-25T13:00:00Z", "likes": 0 }
```

### POST `/api/elogios/[id]/like`
- Dá like em elogio
- **Retorno:**
```json
{ "success": true, "likes": 4 }
```

---

## Observações Gerais

- **Autenticação:** Todos os endpoints (exceto login) exigem header `Authorization: Bearer <token>`.
- **Roles:**
  - `SUPER_ADMIN`: gerencia empresas
  - `COMPANY_ADMIN`: gerencia usuários, itens, categorias da própria empresa
  - `COLLABORATOR`: pode elogiar, resgatar recompensas, ver saldo
- **Erros comuns:**
  - 401: Não autenticado
  - 403: Permissão insuficiente
  - 404: Não encontrado
  - 409: Conflito (ex: email já cadastrado)
- **Exemplo de uso do token:**
```http
GET /api/users HTTP/1.1
Host: employeah.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...
```
- **Modelos de objetos:**
  - `User`: `{ id, name, email, role, companyId }`
  - `Company`: `{ id, name }`
  - `Item`: `{ id, name, price, stock, categoryId }`
  - `Category`: `{ id, name }`
  - `Transaction`: `{ id, type, amount, createdAt, description }`
  - `Elogio`: `{ id, message, fromId, toId, createdAt, likes }`

---

Para detalhes adicionais, consulte o código-fonte ou abra uma issue.
