# Cart - Contratos

As rotas abaixo exigem bot iniciado.

## GET /cart?botId=<uuid>&realtime=true
Equivalente `/carrinho` com reconciliacao em tempo real.
Response 200:
```json
{
  "hasLocalData": true,
  "totalTickets": 2,
  "divergences": ["Conta 2"],
  "events": [
    {
      "eventId": "123",
      "eventName": "Jogo X",
      "hold": { "sectorName": "Norte", "price": "R$ 80", "remainingSeconds": 1100 },
      "tickets": [
        { "accountId": "uuid", "accountName": "Socio Principal", "count": 2, "remainingSeconds": 1100 }
      ]
    }
  ],
  "cartUrl": "https://ingressos.flamengo.com.br/shopping-cart"
}
```
