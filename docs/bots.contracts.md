# Bots - Contratos

## POST /bots
Cria um novo bot para o usuario logado.
Body:
```json
{ "name": "Bot Flamengo Principal" }
```
Response 201:
```json
{ "bot": { "id": "uuid", "name": "...", "is_running": false, "created_at": "ISO", "updated_at": "ISO" } }
```

## GET /bots
Lista bots do usuario.
Response 200:
```json
{ "bots": [{ "id": "uuid", "name": "...", "is_running": true, "created_at": "ISO", "updated_at": "ISO" }] }
```

## GET /bots/:botId/status
Response 200:
```json
{
  "bot": { "id": "uuid", "name": "...", "is_running": true },
  "monitor": {
    "runtime": { "status": "running", "last_cycle_at": "ISO", "last_error": null },
    "worker": { "running": true, "stopRequested": false }
  }
}
```

## POST /bots/:botId/start
Inicia monitoramento do bot.
Response 200:
```json
{ "alreadyRunning": false }
```

## POST /bots/:botId/pause
Pausa bot.
Response 204.

## GET /bots/:botId/logs?limit=100
Response 200:
```json
{
  "logs": [
    { "id": 1, "level": "info", "message": "Bot iniciado", "payload": {}, "created_at": "ISO" }
  ]
}
```
