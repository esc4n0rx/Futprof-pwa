# Accounts - Contratos

As contas ficam vinculadas ao `botId`.

## GET /accounts?botId=<uuid>
Response 200:
```json
{
  "accounts": [
    {
      "id": "uuid",
      "name": "Socio Principal",
      "base_url": "https://ingressos.flamengo.com.br/",
      "email": "conta@email.com",
      "is_primary": true,
      "is_active": true,
      "created_at": "ISO",
      "updated_at": "ISO"
    }
  ]
}
```

## POST /accounts
Body:
```json
{
  "botId": "uuid",
  "name": "Conta 2",
  "baseUrl": "https://ingressos.flamengo.com.br/",
  "email": "conta2@email.com",
  "password": "123456",
  "makePrimary": false
}
```
Response 201: `{ "account": { ... } }`

## PUT /accounts/:accountId
Body:
```json
{
  "botId": "uuid",
  "name": "Conta Atualizada",
  "baseUrl": "https://ingressos.flamengo.com.br/",
  "email": "novo@email.com",
  "password": "novaSenha"
}
```

## DELETE /accounts/:accountId?botId=<uuid>
Response 204.

## POST /accounts/primary
Body:
```json
{ "botId": "uuid", "accountId": "uuid" }
```

## POST /accounts/active
Body:
```json
{ "botId": "uuid", "accountId": "uuid" }
```

## DELETE /accounts/reset-bot?botId=<uuid>
Equivalente ao `/dead` (limpa estado do bot selecionado).
Response 204.
