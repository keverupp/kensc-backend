# 📑 Documentação — Kesnc API

---

# 🎯 1. **Usuário**

## `POST /user/register`

**Descrição:**  
Cria um novo usuário gerando um UUID único.

**Requisição:**

- `Content-Type: application/json`
- Body obrigatório (mesmo vazio):

```json
{}
```

**Resposta de sucesso:**

```json
{
  "userId": "7ee78bb6-6c09-47c6-b93f-65919884bbas"
}
```

---

# 🎯 2. **Grupos**

## `POST /group/create`

**Descrição:**  
Cria um novo grupo de saves e associa o criador como primeiro membro.

**Requisição:**

- `Content-Type: application/json`
- Headers:
  - `x-user-id`: UUID do usuário

**Body:**

```json
{
  "name": "Nome do Grupo"
}
```

**Resposta de sucesso:**

```json
{
  "groupId": "32849144-976a-48ee-bf3a-e62805b62c86"
}
```

---

## `POST /group/join`

**Descrição:**  
Entra em um grupo existente.

**Requisição:**

- `Content-Type: application/json`
- Headers:
  - `x-user-id`: UUID do usuário

**Body:**

```json
{
  "groupId": "32849144-976a-48ee-bf3a-e62805b62c86"
}
```

**Resposta de sucesso:**

```json
{
  "success": true
}
```

---

## `GET /group/members/:groupId`

**Descrição:**  
Lista os membros de um grupo.  
**Apenas o criador do grupo** pode acessar essa rota.

**Requisição:**

- Headers:
  - `x-user-id`: UUID do usuário (criador do grupo)

**Resposta de sucesso:**

```json
{
  "groupId": "32849144-976a-48ee-bf3a-e62805b62c86",
  "members": [
    {
      "id": "7ee78bb6-6c09-47c6-b93f-65919884bbas",
      "createdAt": "2025-04-26T20:24:15.567Z"
    },
    {
      "id": "8ff78cc6-7c08-47c6-a12f-21319884aaaa",
      "createdAt": "2025-04-26T21:01:15.567Z"
    }
  ]
}
```

**Se não for criador:**  
Retorna erro 403.

```json
{
  "error": "Acesso negado. Apenas o criador pode listar membros."
}
```

---

# 🎯 3. **Saves**

## `POST /save/upload`

**Descrição:**  
Envia arquivos de saves (personagens ou mundos) para o grupo.

**Requisição:**

- `Content-Type: multipart/form-data`
- Headers:
  - `x-user-id`: UUID do usuário

**Form fields obrigatórios:**
- `groupId`: ID do grupo
- `type`: `WORLD` ou `CHARACTER`
- Arquivos: múltiplos arquivos de save

**Exemplo de envio:**

```bash
curl -X POST http://localhost:3000/save/upload \
-H "x-user-id: {UUID}" \
-F "groupId=32849144-976a-48ee-bf3a-e62805b62c86" \
-F "type=WORLD" \
-F "file=@/path/to/savefile.sav"
```

**Resposta de sucesso:**

```json
{
  "success": true
}
```

---

## `GET /save/status/:groupId`

**Descrição:**  
Verifica se existe um save WORLD e/ou CHARACTER para o grupo.

**Requisição:**

- Headers:
  - `x-user-id`: UUID do usuário

**Resposta de sucesso:**

```json
{
  "WORLD": {
    "exists": true,
    "lastUpdated": "2025-04-26T20:24:15.567Z"
  },
  "CHARACTER": {
    "exists": false
  }
}
```

---

# 🎯 4. **Arquivos**

## `GET /files/:groupId/:type/:filename`

**Descrição:**  
Baixar um arquivo específico (save de personagem ou mundo).

**Requisição:**

- Parâmetros na URL:
  - `groupId`: ID do grupo
  - `type`: `WORLD` ou `CHARACTER`
  - `filename`: nome do arquivo

**Exemplo de download:**

```bash
curl http://localhost:3000/files/32849144-976a-48ee-bf3a-e62805b62c86/WORLD/save1.sav --output save1.sav
```

**Resposta:**
- Retorna o arquivo direto para download.

---

# 📢 Observações gerais de uso

| Item | Observação |
|:---|:---|
| Autenticação | Baseada em UUID simples via header `x-user-id` |
| Uploads | Limite de 20MB por arquivo no backend atual |
| Permissões | Criador do grupo tem permissões extras (listar membros) |
| Tipos aceitos | `WORLD` e `CHARACTER` |
| Atualização de saves | Quando um novo save é enviado, ele substitui o anterior |

---

# 🛡 Exemplo de fluxo de uso

1. Primeiro acesso → `POST /user/register`
2. Cria grupo → `POST /group/create`
3. Convida amigos para o grupo (envia o `groupId`)
4. Amigos entram no grupo → `POST /group/join`
5. Upload de saves → `POST /save/upload`
6. Todos podem baixar os saves atualizados → `GET /files/:groupId/:type/:filename`

---
