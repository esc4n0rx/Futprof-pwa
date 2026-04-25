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
