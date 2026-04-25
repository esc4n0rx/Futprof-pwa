# Purchase - Contratos

As rotas abaixo exigem bot iniciado.

## GET /purchase/targets?botId=<uuid>
Equivalente `/alvos`.
Response 200:
```json
{
  "targets": [
    { "eventId": "123", "name": "Jogo X", "enabled": true }
  ]
}
```

## POST /purchase/targets/toggle
Equivalente `/alvo <n>`.
Body:
```json
{ "botId": "uuid", "eventId": "123" }
```
Response 204.

## POST /purchase/targets/all
Equivalente `/alvo todos`.
Body:
```json
{ "botId": "uuid" }
```
Response 204.

## POST /purchase/attempt
Tentativa manual de reserva.
Body:
```json
{
  "botId": "uuid",
  "eventId": "123",
  "sectorId": "15",
  "sectorName": "Norte",
  "price": "R$ 80"
}
```
Response 200 (sucesso):
```json
{
  "success": true,
  "accountName": "Socio Principal",
  "ticketCount": 1,
  "maxTicketsPerAccount": 3,
  "cartUrl": "https://ingressos.flamengo.com.br/shopping-cart",
  "attempts": [
    {
      "endpoint": "member/book-multiple-tickets",
      "success": false,
      "httpStatus": 200,
      "responseStatus": 0,
      "message": "Setor indisponivel",
      "error": null,
      "retryAfterSeconds": null,
      "responsePreview": { "status": 0, "message": "Setor indisponivel" }
    },
    {
      "endpoint": "buy/book-multiple-tickets-sectors",
      "success": true,
      "httpStatus": 200,
      "responseStatus": 2,
      "message": null,
      "error": null,
      "retryAfterSeconds": null,
      "responsePreview": { "status": 2 }
    }
  ]
}
```

Response 200 (falha):
```json
{
  "success": false,
  "failures": [
    {
      "accountId": "uuid",
      "accountName": "Socio Principal",
      "reason": "member/book-multiple-tickets: HTTP 200 status=0 Setor indisponivel | buy/book-multiple-tickets-sectors: HTTP 200 status=0 Setor indisponivel",
      "attempts": [
        {
          "endpoint": "member/book-multiple-tickets",
          "success": false,
          "httpStatus": 200,
          "responseStatus": 0,
          "message": "Setor indisponivel",
          "error": null,
          "retryAfterSeconds": null,
          "responsePreview": { "status": 0, "message": "Setor indisponivel" }
        },
        {
          "endpoint": "buy/book-multiple-tickets-sectors",
          "success": false,
          "httpStatus": 200,
          "responseStatus": 0,
          "message": "Setor indisponivel",
          "error": null,
          "retryAfterSeconds": null,
          "responsePreview": { "status": 0, "message": "Setor indisponivel" }
        }
      ]
    },
    {
      "accountId": "uuid",
      "accountName": "Conta 2",
      "reason": "LOGIN_FAILED"
    },
    {
      "accountId": "uuid",
      "accountName": "Conta 3",
      "reason": "ACCOUNT_CART_LIMIT"
    }
  ]
}
```

Notas:
- `attempts` detalha cada endpoint acionado no site do Flamengo.
- `responseStatus` é o campo `status` retornado pelo site quando a resposta é JSON.
- `responsePreview` é limitado e serve apenas para diagnóstico no front/log.
