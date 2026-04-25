# Contratos de API - Backend Bot

Todos os contratos do frontend estao nesta pasta, separados por modulo.

Arquivos:
- `auth.contracts.md`
- `bots.contracts.md`
- `accounts.contracts.md`
- `monitoring.contracts.md`
- `purchase.contracts.md`
- `cart.contracts.md`
- `account-creation.contracts.md`

Base URL local: `http://localhost:3001/api`

Autenticacao:
- Enviar `Authorization: Bearer <accessToken>` nas rotas protegidas.

Padrao de erro:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Mensagem"
  }
}
```
