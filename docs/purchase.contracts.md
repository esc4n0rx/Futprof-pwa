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
  "cartUrl": "https://ingressos.flamengo.com.br/shopping-cart"
}
```
