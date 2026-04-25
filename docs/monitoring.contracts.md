# Monitoring - Contratos

As rotas abaixo exigem `botId` e bot em execucao.

## POST /monitor/start
Body:
```json
{ "botId": "uuid" }
```
Response 200: `{ "alreadyRunning": false }`

## POST /monitor/stop
Body:
```json
{ "botId": "uuid" }
```
Response 204.

## GET /monitor/status?botId=<uuid>
Response 200:
```json
{
  "runtime": { "status": "running", "last_cycle_at": "ISO", "last_error": null },
  "worker": { "running": true, "stopRequested": false }
}
```

## POST /monitor/refresh
Body ou query com `botId`.
Response 200: `{ "ok": true }`

## GET /monitor/events?botId=<uuid>
Equivalente ao `/eventos`.
Response 200:
```json
{
  "events": [
    {
      "index": 1,
      "eventId": "123",
      "name": "Jogo X",
      "href": "https://...",
      "monitored": true,
      "purchaseEnabled": true,
      "notificationsEnabled": true,
      "updatedAt": "ISO"
    }
  ]
}
```

## GET /monitor/sectors?botId=<uuid>
Equivalente ao `/setores`.
Response 200:
```json
{
  "sessions": [
    {
      "eventId": "123",
      "eventName": "Jogo X",
      "sectors": [
        { "sectorId": "1", "name": "Norte", "price": "R$ 80", "available": false, "updatedAt": "ISO" }
      ]
    }
  ]
}
```

## GET /monitor/notifications?botId=<uuid>&limit=100
Response 200:
```json
{
  "notifications": [
    { "id": 10, "type": "SECTOR_OPENED", "event_id": "123", "payload": {}, "created_at": "ISO" }
  ]
}
```

Exemplo de `payload` para `type=PURCHASE_FAILED`:
```json
{
  "eventName": "Jogo X",
  "sectorName": "Norte",
  "price": "R$ 80",
  "reason": "Nenhuma conta conseguiu reservar",
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
    }
  ]
}
```

Notas:
- `failures` aparece nas falhas de compra automatica e resume o resultado por conta.
- `attempts` detalha os endpoints de reserva acionados no site.

## POST /monitor/scope/monitor
Equivalente `/monitor`.
```json
{ "botId": "uuid", "mode": "all" }
```
ou
```json
{ "botId": "uuid", "mode": "event", "eventId": "123" }
```

## POST /monitor/scope/purchase
Equivalente `/alvo`.
Mesmo payload de scope monitor (`mode=all|event`).

## POST /monitor/scope/notifications
Equivalente `/filtro`.
Mesmo payload de scope monitor (`mode=all|event`).

## POST /monitor/scope/sectors
Equivalente `/setor`.
Payload:
```json
{
  "botId": "uuid",
  "mode": "all|specific|add|remove",
  "selections": [
    { "eventId": "123", "sectorId": "15" }
  ]
}
```
